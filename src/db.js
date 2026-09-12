const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'maison_miro.db');
const seedPath = path.join(dataDir, 'seed.json');
const adminEmail = String(process.env.ADMIN_EMAIL || 'studio@maisonmiro.com').trim();
const adminPassword = String(process.env.ADMIN_PASSWORD || '').trim();

if (!adminPassword) {
  throw new Error('Missing required env ADMIN_PASSWORD. Set ADMIN_PASSWORD before starting the app.');
}

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function hashPassword(password) {
  return bcrypt.hashSync(String(password || ''), 12);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(String(password || ''), String(hash || ''));
}

function getSeed() {
  if (!fs.existsSync(seedPath)) {
    return { products: [], patterns: [], portfolio: [], orders: [], bookings: [], contact_messages: [], downloads: [], admin_users: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  } catch (error) {
    return { products: [], patterns: [], portfolio: [], orders: [], bookings: [], contact_messages: [], downloads: [], admin_users: [] };
  }
}

function defaultDb() {
  const seed = getSeed();
  return {
    admin_users: [
      {
        id: 'admin_default',
        email: adminEmail,
        password_hash: hashPassword(adminPassword),
        name: 'Studio Admin',
        must_change_password: true,
        created_at: new Date().toISOString(),
      },
    ],
    products: Array.isArray(seed.products) ? seed.products : [],
    patterns: Array.isArray(seed.patterns) ? seed.patterns : [],
    portfolio: Array.isArray(seed.portfolio) ? seed.portfolio : [],
    orders: Array.isArray(seed.orders) ? seed.orders : [],
    bookings: Array.isArray(seed.bookings) ? seed.bookings : [],
    contact_messages: Array.isArray(seed.contact_messages) ? seed.contact_messages : [],
    downloads: Array.isArray(seed.downloads) ? seed.downloads : [],
  };
}

function readDb() {
  ensureDataDir();
  if (!fs.existsSync(dbPath)) {
    const fresh = defaultDb();
    fs.writeFileSync(dbPath, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }

  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    const parsed = JSON.parse(raw);
    const base = defaultDb();
    return {
      admin_users: Array.isArray(parsed.admin_users) && parsed.admin_users.length ? parsed.admin_users : base.admin_users,
      products: Array.isArray(parsed.products) ? parsed.products : base.products,
      patterns: Array.isArray(parsed.patterns) ? parsed.patterns : base.patterns,
      portfolio: Array.isArray(parsed.portfolio) ? parsed.portfolio : base.portfolio,
      orders: Array.isArray(parsed.orders) ? parsed.orders : base.orders,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : base.bookings,
      contact_messages: Array.isArray(parsed.contact_messages) ? parsed.contact_messages : base.contact_messages,
      downloads: Array.isArray(parsed.downloads) ? parsed.downloads : base.downloads,
    };
  } catch (error) {
    const fresh = defaultDb();
    fs.writeFileSync(dbPath, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }
}

function writeDb(data) {
  ensureDataDir();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    color: product.color || 'Neutral',
    price: Number(product.price || 0),
    originalPrice: Number(product.originalPrice || product.price || 0),
    theme: product.theme || { bg: '#f5f5f5', accent: '#111111', accent2: '#ffffff' },
    sizes: Array.isArray(product.sizes) ? product.sizes : ['M'],
    image: product.image || '',
    gallery: Array.isArray(product.gallery) ? product.gallery : [product.image || ''],
    description: product.description || '',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function normalizePattern(pattern) {
  return {
    id: pattern.id,
    name: pattern.name,
    skill: pattern.skill || 'Beginner',
    price: Number(pattern.price || 0),
    image: pattern.image || '',
    preview: Array.isArray(pattern.preview) ? pattern.preview : [pattern.image || ''],
    description: pattern.description || '',
    createdAt: pattern.createdAt,
    updatedAt: pattern.updatedAt,
  };
}

function normalizePortfolio(item) {
  return {
    id: item.id,
    title: item.title,
    category: item.category || 'Editorial',
    image: item.image || '',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function initDatabase() {
  ensureDataDir();
  const db = readDb();

  const defaultAdmin = db.admin_users.find((user) => (user.email || '').toLowerCase() === adminEmail.toLowerCase());
  if (!defaultAdmin) {
    db.admin_users.push({
      id: 'admin_default',
      email: adminEmail,
      password_hash: hashPassword(adminPassword),
      name: 'Studio Admin',
      must_change_password: true,
      created_at: new Date().toISOString(),
    });
  } else {
    defaultAdmin.email = adminEmail;
    defaultAdmin.password_hash = defaultAdmin.password_hash || hashPassword(adminPassword);
    defaultAdmin.name = defaultAdmin.name || 'Studio Admin';
    defaultAdmin.must_change_password = defaultAdmin.must_change_password ?? true;
  }

  const seed = getSeed();
  if (!db.products.length && Array.isArray(seed.products)) db.products = seed.products;
  if (!db.patterns.length && Array.isArray(seed.patterns)) db.patterns = seed.patterns;
  if (!db.portfolio.length && Array.isArray(seed.portfolio)) db.portfolio = seed.portfolio;

  writeDb(db);
  return db;
}

function getAdminUserByEmail(email) {
  const lookup = String(email || '').trim().toLowerCase();
  const user = readDb().admin_users.find((entry) => String(entry.email || '').trim().toLowerCase() === lookup);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.password_hash,
    mustChangePassword: Boolean(user.must_change_password),
  };
}

function verifyAdminCredentials(email, password) {
  const user = getAdminUserByEmail(email);
  if (!user) return false;
  return comparePassword(password, user.passwordHash);
}

function setAdminPassword(email, newPassword) {
  const db = readDb();
  const index = db.admin_users.findIndex((entry) => String(entry.email || '').trim().toLowerCase() === String(email || '').trim().toLowerCase());
  if (index === -1) return false;
  db.admin_users[index].password_hash = hashPassword(newPassword);
  db.admin_users[index].must_change_password = false;
  writeDb(db);
  return true;
}

function listProducts() {
  return readDb().products.map(normalizeProduct);
}

function listPatterns() {
  return readDb().patterns.map(normalizePattern);
}

function listPortfolio() {
  return readDb().portfolio.map(normalizePortfolio);
}

function listOrders() {
  return readDb().orders.map((order) => ({
    id: order.id,
    customer: order.customer || {},
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total || 0),
    shipping: Number(order.shipping || 0),
    status: order.status,
    createdAt: order.createdAt,
  }));
}

function listBookings() {
  return readDb().bookings.map((row) => ({
    id: row.id,
    ...row,
    status: row.status || 'Pending',
  }));
}

function listContactMessages() {
  return readDb().contact_messages.map((row) => ({
    id: row.id,
    ...row,
    createdAt: row.createdAt,
  }));
}

function listDownloads() {
  return readDb().downloads.map((row) => ({
    id: row.id,
    patternId: row.patternId,
    patternName: row.patternName,
    token: row.token,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  }));
}

function getDownloadByToken(token) {
  const row = readDb().downloads.find((entry) => entry.token === token);
  if (!row) return null;
  return {
    id: row.id,
    patternId: row.patternId,
    patternName: row.patternName,
    token: row.token,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

async function createOrder(order) {
  const db = readDb();
  const record = {
    id: order.id || createId('order'),
    customer: order.customer || {},
    items: Array.isArray(order.items) ? order.items : [],
    total: Number(order.total || 0),
    shipping: Number(order.shipping || 0),
    status: order.status || 'Pending',
    createdAt: new Date().toISOString(),
  };
  db.orders.push(record);
  writeDb(db);
  return record;
}

async function createBooking(payload) {
  const db = readDb();
  const booking = {
    id: payload.id || createId('booking'),
    ...payload,
    status: payload.status || 'Pending',
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(booking);
  writeDb(db);
  return booking;
}

async function createContactMessage(payload) {
  const db = readDb();
  const message = {
    id: payload.id || createId('contact'),
    ...payload,
    createdAt: new Date().toISOString(),
  };
  db.contact_messages.push(message);
  writeDb(db);
  return message;
}

async function createDownloadRecord(payload) {
  const db = readDb();
  const record = {
    id: payload.id || createId('download'),
    patternId: payload.patternId || '',
    patternName: payload.patternName || 'Pattern',
    token: payload.token || createId('download_token'),
    expiresAt: payload.expiresAt || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  db.downloads.push(record);
  writeDb(db);
  return record;
}

async function createProduct(payload) {
  const db = readDb();
  const product = {
    id: payload.id || createId('product'),
    name: payload.name || 'Untitled product',
    category: payload.category || 'General',
    color: payload.color || 'Neutral',
    price: Number(payload.price || 0),
    originalPrice: Number(payload.originalPrice || payload.price || 0),
    theme: payload.theme || { bg: '#f5f5f5', accent: '#111111', accent2: '#ffffff' },
    sizes: Array.isArray(payload.sizes) ? payload.sizes : ['M'],
    image: payload.image || '',
    gallery: Array.isArray(payload.gallery) ? payload.gallery : [payload.image || ''],
    description: payload.description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.products.push(product);
  writeDb(db);
  return normalizeProduct(product);
}

async function updateProduct(id, patch) {
  const db = readDb();
  const index = db.products.findIndex((product) => product.id === id);
  if (index === -1) return null;
  const current = db.products[index];
  const next = {
    ...current,
    ...patch,
    price: Number(patch.price ?? current.price),
    originalPrice: Number(patch.originalPrice ?? current.originalPrice ?? current.price),
    sizes: Array.isArray(patch.sizes) ? patch.sizes : current.sizes || ['M'],
    gallery: Array.isArray(patch.gallery) ? patch.gallery : current.gallery || [current.image],
    updatedAt: new Date().toISOString(),
  };
  db.products[index] = next;
  writeDb(db);
  return normalizeProduct(next);
}

async function deleteProduct(id) {
  const db = readDb();
  db.products = db.products.filter((product) => product.id !== id);
  writeDb(db);
}

async function createPattern(payload) {
  const db = readDb();
  const pattern = {
    id: payload.id || createId('pattern'),
    name: payload.name || 'Untitled pattern',
    skill: payload.skill || 'Beginner',
    price: Number(payload.price || 0),
    image: payload.image || '',
    preview: Array.isArray(payload.preview) ? payload.preview : [payload.image || ''],
    description: payload.description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.patterns.push(pattern);
  writeDb(db);
  return normalizePattern(pattern);
}

async function updatePattern(id, patch) {
  const db = readDb();
  const index = db.patterns.findIndex((pattern) => pattern.id === id);
  if (index === -1) return null;
  const current = db.patterns[index];
  const next = {
    ...current,
    ...patch,
    price: Number(patch.price ?? current.price),
    preview: Array.isArray(patch.preview) ? patch.preview : current.preview || [current.image],
    updatedAt: new Date().toISOString(),
  };
  db.patterns[index] = next;
  writeDb(db);
  return normalizePattern(next);
}

async function deletePattern(id) {
  const db = readDb();
  db.patterns = db.patterns.filter((pattern) => pattern.id !== id);
  writeDb(db);
}

async function createPortfolioItem(payload) {
  const db = readDb();
  const item = {
    id: payload.id || createId('portfolio'),
    title: payload.title || 'Untitled project',
    category: payload.category || 'Editorial',
    image: payload.image || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.portfolio.push(item);
  writeDb(db);
  return normalizePortfolio(item);
}

async function updatePortfolioItem(id, patch) {
  const db = readDb();
  const index = db.portfolio.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const current = db.portfolio[index];
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  db.portfolio[index] = next;
  writeDb(db);
  return normalizePortfolio(next);
}

async function deletePortfolioItem(id) {
  const db = readDb();
  db.portfolio = db.portfolio.filter((item) => item.id !== id);
  writeDb(db);
}

module.exports = {
  db: { path: dbPath },
  initDatabase,
  createId,
  getAdminUserByEmail,
  verifyAdminCredentials,
  setAdminPassword,
  listProducts,
  listPatterns,
  listPortfolio,
  listOrders,
  listBookings,
  listContactMessages,
  listDownloads,
  getDownloadByToken,
  createOrder,
  createBooking,
  createContactMessage,
  createDownloadRecord,
  createProduct,
  updateProduct,
  deleteProduct,
  createPattern,
  updatePattern,
  deletePattern,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
};
