const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

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
