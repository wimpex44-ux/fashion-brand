const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'TestPass123!';

const dbPath = path.join(__dirname, '..', 'data', 'maison_miro.db');

test('database bootstrap creates admin tables and seed data', async () => {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  const { initDatabase, listProducts } = require('../src/db');
  await initDatabase();

  assert.ok(fs.existsSync(dbPath), 'SQLite database should exist after initialization');
  const products = listProducts();
  assert.ok(Array.isArray(products) && products.length > 0, 'seed products should be loaded');
});

test('admin credentials are seeded locally', async () => {
  const { getAdminUserByEmail } = require('../src/db');
  const admin = getAdminUserByEmail('studio@maisonmiro.com');
  assert.ok(admin, 'default admin should be seeded');
  assert.equal(admin.email, 'studio@maisonmiro.com');
});

test('missing ADMIN_PASSWORD fails startup instead of using a default secret', () => {
  const originalPassword = process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_PASSWORD;
  delete require.cache[require.resolve('../src/db')];

  assert.throws(() => require('../src/db'), /ADMIN_PASSWORD/i, 'startup should fail when ADMIN_PASSWORD is not set');

  if (originalPassword !== undefined) {
    process.env.ADMIN_PASSWORD = originalPassword;
  }
  delete require.cache[require.resolve('../src/db')];
});

test('admin uploads require CSRF protection for state-changing requests', async () => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '4011', ADMIN_PASSWORD: 'TestPass123!' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const stdout = [];
  const stderr = [];
  child.stdout.on('data', (chunk) => stdout.push(chunk.toString()));
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));

  async function waitForServer() {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const response = await fetch('http://127.0.0.1:4011/api/health', { signal: AbortSignal.timeout(1000) });
        if (response.ok) return;
      } catch (error) {
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`server did not start in time. stdout=${stdout.join('')} stderr=${stderr.join('')}`);
  }

  try {
    await waitForServer();

    const loginResponse = await fetch('http://127.0.0.1:4011/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'studio@maisonmiro.com', password: 'TestPass123!' }),
      credentials: 'include',
    });
    const loginData = await loginResponse.json();
    const setCookie = loginResponse.headers.get('set-cookie') || '';
    assert.equal(loginResponse.status, 200, `login should succeed: ${JSON.stringify(loginData)}`);
    assert.ok(loginData.csrfToken, 'csrf token should be issued when admin login succeeds');

    const form = new FormData();
    form.append('image', new Blob(['fake-image'], { type: 'image/png' }), 'photo.png');

    const uploadResponse = await fetch('http://127.0.0.1:4011/api/admin/upload', {
      method: 'POST',
      credentials: 'include',
      headers: setCookie ? { Cookie: setCookie } : {},
      body: form,
    });
    const uploadData = await uploadResponse.json().catch(() => ({}));
    assert.equal(uploadResponse.status, 403, `upload without CSRF should be rejected, got ${uploadResponse.status}: ${JSON.stringify(uploadData)}`);
  } finally {
    child.kill('SIGTERM');
  }
});

test('pattern download rejects sessions for a different pattern', async () => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '4012', ADMIN_PASSWORD: 'TestPass123!' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const stdout = [];
  const stderr = [];
  child.stdout.on('data', (chunk) => stdout.push(chunk.toString()));
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));

  async function waitForServer() {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const response = await fetch('http://127.0.0.1:4012/api/health', { signal: AbortSignal.timeout(1000) });
        if (response.ok) return;
      } catch (error) {
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`server did not start in time. stdout=${stdout.join('')} stderr=${stderr.join('')}`);
  }

  try {
    await waitForServer();
    const patternsResponse = await fetch('http://127.0.0.1:4012/api/patterns');
    const patternsData = await patternsResponse.json();
    const pattern = patternsData.patterns[0];
    assert.ok(pattern, 'seed patterns should exist for the mismatch test');

    const purchaseResponse = await fetch('http://127.0.0.1:4012/api/patterns/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patternId: pattern.id, patternName: pattern.name }),
    });
    const purchaseData = await purchaseResponse.json();
    assert.equal(purchaseResponse.status, 201, `pattern purchase should succeed: ${JSON.stringify(purchaseData)}`);
    assert.ok(purchaseData.sessionId, 'mock checkout session should be returned');

    const mismatchResponse = await fetch(`http://127.0.0.1:4012/api/patterns/download?patternId=${encodeURIComponent('different-pattern')}&patternName=${encodeURIComponent('Different Pattern')}&session_id=${encodeURIComponent(purchaseData.sessionId)}`);
    const mismatchData = await mismatchResponse.json();
    assert.equal(mismatchResponse.status, 403, `mismatched pattern session should be rejected, got ${mismatchResponse.status}: ${JSON.stringify(mismatchData)}`);
  } finally {
    child.kill('SIGTERM');
  }
});

test('order confirmation rejects sessions for a different order', async () => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '4013', ADMIN_PASSWORD: 'TestPass123!' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const stdout = [];
  const stderr = [];
  child.stdout.on('data', (chunk) => stdout.push(chunk.toString()));
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));

  async function waitForServer() {
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const response = await fetch('http://127.0.0.1:4013/api/health', { signal: AbortSignal.timeout(1000) });
        if (response.ok) return;
      } catch (error) {
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`server did not start in time. stdout=${stdout.join('')} stderr=${stderr.join('')}`);
  }

  try {
    await waitForServer();
    const checkoutResponse = await fetch('http://127.0.0.1:4013/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: 'Test Buyer', email: 'buyer@example.com' },
        items: [{ product: { name: 'The Atelier Blazer', price: 240 }, qty: 1 }],
        total: 258,
        shipping: 18,
      }),
    });
    const checkoutData = await checkoutResponse.json();
    assert.equal(checkoutResponse.status, 201, `checkout should succeed: ${JSON.stringify(checkoutData)}`);
    const sessionId = checkoutData.order.checkoutSessionId;
    assert.ok(sessionId, 'checkout should return a Stripe/mock session id');

    const confirmResponse = await fetch(`http://127.0.0.1:4013/api/orders/confirm?session_id=${encodeURIComponent(sessionId)}&orderId=${encodeURIComponent('different-order')}`);
    const confirmData = await confirmResponse.json();
    assert.equal(confirmResponse.status, 403, `mismatched order session should be rejected, got ${confirmResponse.status}: ${JSON.stringify(confirmData)}`);
  } finally {
    child.kill('SIGTERM');
  }
});
