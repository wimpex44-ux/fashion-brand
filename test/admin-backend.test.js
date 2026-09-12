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
        // server still starting
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
