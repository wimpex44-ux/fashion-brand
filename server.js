const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  initDatabase,
  createId,
  verifyAdminCredentials,
  getAdminUserByEmail,
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
} = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(rootDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'Maison Miro API', timestamp: new Date().toISOString() });
});

app.get('/api/products', async (req, res) => {
  res.json({ products: await listProducts() });
});

app.get('/api/patterns', async (req, res) => {
  res.json({ patterns: await listPatterns() });
});

app.get('/api/portfolio', async (req, res) => {
  res.json({ portfolio: await listPortfolio() });
});

app.get('/api/orders', async (req, res) => {
  res.json({ orders: await listOrders() });
});

app.get('/api/bookings', async (req, res) => {
  res.json({ bookings: await listBookings() });
});

app.post('/api/checkout', async (req, res) => {
  const { customer, items, total, shipping } = req.body;
  const order = await createOrder({
    id: createId('order'),
    customer,
    items: Array.isArray(items) ? items : [],
    total: Number(total || 0),
    shipping: Number(shipping || 0),
    status: 'Paid',
  });

  res.status(201).json({ ok: true, order });
});

app.post('/api/bookings', async (req, res) => {
  const booking = await createBooking({
    ...req.body,
    status: 'Pending',
  });

  res.status(201).json({ ok: true, booking });
});

app.post('/api/contact', async (req, res) => {
  const message = await createContactMessage(req.body);
  res.status(201).json({ ok: true, message });
});

app.post('/api/patterns/purchase', async (req, res) => {
  const { patternId, patternName } = req.body;
  const token = createId('download');
  const record = await createDownloadRecord({
    patternId,
    patternName,
    token,
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  });

  res.status(201).json({
    ok: true,
    downloadUrl: `/api/download/${record.token}`,
    token,
    expiresAt: record.expiresAt,
  });
});

app.get('/api/download/:token', async (req, res) => {
  const record = await getDownloadByToken(req.params.token);
  if (!record) {
    return res.status(404).json({ ok: false, message: 'Download token not found.' });
  }

  const expired = new Date(record.expiresAt).getTime() < Date.now();
  if (expired) {
    return res.status(410).json({ ok: false, message: 'Download link has expired.' });
  }

  res.json({
    ok: true,
    fileName: `${record.patternName || 'pattern'}.pdf`,
    downloadUrl: `/downloads/${record.patternId || 'pattern'}.pdf`,
    message: 'This is a secure token-gated download placeholder for the pattern PDF.',
  });
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body || {};
  const valid = await verifyAdminCredentials(email, password);
  if (!valid) {
    return res.status(401).json({ ok: false, message: 'Invalid admin credentials.' });
  }

  const user = await getAdminUserByEmail(email);
  return res.json({
    ok: true,
    admin: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
});

app.get('/api/admin/summary', async (req, res) => {
  const [products, orders, bookings, downloads] = await Promise.all([
    listProducts(),
    listOrders(),
    listBookings(),
    listDownloads(),
  ]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  res.json({
    ok: true,
    revenue,
    orders: orders.length,
    bookings: bookings.length,
    downloads: downloads.length,
    products: products.length,
  });
});

app.get('/api/admin/products', async (req, res) => {
  res.json({ ok: true, products: await listProducts() });
});

app.post('/api/admin/products', async (req, res) => {
  try {
    const product = await createProduct(req.body || {});
    res.status(201).json({ ok: true, product });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message || 'Failed to create product.' });
  }
});

app.put('/api/admin/products/:id', async (req, res) => {
  const product = await updateProduct(req.params.id, req.body || {});
  if (!product) {
    return res.status(404).json({ ok: false, message: 'Product not found.' });
  }
  res.json({ ok: true, product });
});

app.delete('/api/admin/products/:id', async (req, res) => {
  await deleteProduct(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/patterns', async (req, res) => {
  res.json({ ok: true, patterns: await listPatterns() });
});

app.post('/api/admin/patterns', async (req, res) => {
  const pattern = await createPattern(req.body || {});
  res.status(201).json({ ok: true, pattern });
});

app.put('/api/admin/patterns/:id', async (req, res) => {
  const pattern = await updatePattern(req.params.id, req.body || {});
  if (!pattern) {
    return res.status(404).json({ ok: false, message: 'Pattern not found.' });
  }
  res.json({ ok: true, pattern });
});

app.delete('/api/admin/patterns/:id', async (req, res) => {
  await deletePattern(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/portfolio', async (req, res) => {
  res.json({ ok: true, portfolio: await listPortfolio() });
});

app.post('/api/admin/portfolio', async (req, res) => {
  const item = await createPortfolioItem(req.body || {});
  res.status(201).json({ ok: true, item });
});

app.put('/api/admin/portfolio/:id', async (req, res) => {
  const item = await updatePortfolioItem(req.params.id, req.body || {});
  if (!item) {
    return res.status(404).json({ ok: false, message: 'Portfolio item not found.' });
  }
  res.json({ ok: true, item });
});

app.delete('/api/admin/portfolio/:id', async (req, res) => {
  await deletePortfolioItem(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/orders', async (req, res) => {
  res.json({ ok: true, orders: await listOrders() });
});

app.get('/api/admin/bookings', async (req, res) => {
  res.json({ ok: true, bookings: await listBookings() });
});

app.get('/api/admin/contact', async (req, res) => {
  res.json({ ok: true, messages: await listContactMessages() });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  const filePath = path.join(rootDir, req.path);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  const fallback = path.join(rootDir, 'index.html');
  return res.sendFile(fallback);
});

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Maison Miro API running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to boot database-backed app:', error);
  process.exit(1);
});
