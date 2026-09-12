const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const Stripe = require('stripe');
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
  setAdminPassword,
} = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many admin attempts. Please try again later.' },
});

const publicFormLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: 'Too many requests. Please slow down and try again.' },
});

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'maison-miro-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8,
  },
}));
app.use(express.static(rootDir));

function requireAdminSession(req, res, next) {
  if (req.session && req.session.admin && req.session.admin.email) {
    return next();
  }
  return res.status(401).json({ ok: false, message: 'Unauthorized. Please sign in.' });
}

function requireCsrf(req, res, next) {
  const isStateChange = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (!isStateChange) return next();
  const csrfHeader = req.headers['x-csrf-token'];
  const sessionToken = req.session && req.session.csrfToken;
  if (!sessionToken || !csrfHeader || csrfHeader !== sessionToken) {
    return res.status(403).json({ ok: false, message: 'CSRF validation failed.' });
  }
  next();
}

function ensureCsrfToken(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = createId('csrf');
  }
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'Maison Miro API', timestamp: new Date().toISOString() });
});

app.get('/api/csrf-token', ensureCsrfToken, (req, res) => {
  res.json({ ok: true, csrfToken: req.session.csrfToken });
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

app.post('/api/checkout', publicFormLimiter, async (req, res) => {
  const { customer, items, total, shipping } = req.body || {};
  const productItems = Array.isArray(items) ? items : [];
  const computedTotal = productItems.reduce((sum, item) => sum + Number(item.product?.price || item.price || 0) * Number(item.qty || 1), 0);
  const computedShipping = computedTotal > 180 ? 0 : 18;
  const safeTotal = Number(total || computedTotal + computedShipping);

  if (Number(safeTotal) <= 0 || !productItems.length) {
    return res.status(400).json({ ok: false, message: 'Cart is empty or total is invalid.' });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: productItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.product?.name || 'Maison Miro Item' },
          unit_amount: Math.round(Number(item.product?.price || item.price || 0) * 100),
        },
        quantity: Number(item.qty || 1),
      })),
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/confirmation.html?type=order&status=paid`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/checkout.html?cancelled=true`,
      metadata: {
        customer: JSON.stringify(customer || {}),
      },
      payment_method_types: ['card'],
      shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: Math.round((Number(shipping || computedShipping) || 0) * 100), currency: 'usd' }, display_name: 'Shipping' } }],
    });

    const order = await createOrder({
      id: createId('order'),
      customer: customer || {},
      items: productItems,
      total: Number(safeTotal),
      shipping: Number(shipping || computedShipping),
      status: 'Paid',
    });

    res.status(201).json({ ok: true, order, checkoutSessionUrl: checkoutSession.url });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message || 'Unable to create checkout session.' });
  }
});

app.post('/api/bookings', publicFormLimiter, async (req, res) => {
  const booking = await createBooking({
    ...req.body,
    status: 'Pending',
  });

  res.status(201).json({ ok: true, booking });
});

app.post('/api/contact', publicFormLimiter, async (req, res) => {
  const message = await createContactMessage(req.body);
  res.status(201).json({ ok: true, message });
});

app.post('/api/patterns/purchase', publicFormLimiter, async (req, res) => {
  const { patternId, patternName } = req.body || {};
  if (!patternId || !patternName) {
    return res.status(400).json({ ok: false, message: 'Pattern selection is required.' });
  }
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

app.post('/api/admin/login', adminRateLimiter, ensureCsrfToken, async (req, res) => {
  const { email, password } = req.body || {};
  const valid = verifyAdminCredentials(email, password);
  if (!valid) {
    return res.status(401).json({ ok: false, message: 'Invalid admin credentials.' });
  }

  const user = getAdminUserByEmail(email);
  req.session.admin = {
    id: user.id,
    email: user.email,
    name: user.name,
  };

  return res.json({
    ok: true,
    admin: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    csrfToken: req.session.csrfToken,
  });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/admin/summary', requireAdminSession, async (req, res) => {
  const [products, orders, bookings, downloads] = await Promise.all([
    listProducts(),
    listOrders(),
    listBookings(),
    listDownloads(),
  ]);

  const revenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  res.json({ ok: true, revenue, orders: orders.length, bookings: bookings.length, downloads: downloads.length, products: products.length });
});

app.get('/api/admin/products', requireAdminSession, async (req, res) => {
  res.json({ ok: true, products: await listProducts() });
});

app.post('/api/admin/products', requireAdminSession, requireCsrf, async (req, res) => {
  try {
    const product = await createProduct(req.body || {});
    res.status(201).json({ ok: true, product });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message || 'Failed to create product.' });
  }
});

app.put('/api/admin/products/:id', requireAdminSession, requireCsrf, async (req, res) => {
  const product = await updateProduct(req.params.id, req.body || {});
  if (!product) {
    return res.status(404).json({ ok: false, message: 'Product not found.' });
  }
  res.json({ ok: true, product });
});

app.delete('/api/admin/products/:id', requireAdminSession, requireCsrf, async (req, res) => {
  await deleteProduct(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/patterns', requireAdminSession, async (req, res) => {
  res.json({ ok: true, patterns: await listPatterns() });
});

app.post('/api/admin/patterns', requireAdminSession, requireCsrf, async (req, res) => {
  const pattern = await createPattern(req.body || {});
  res.status(201).json({ ok: true, pattern });
});

app.put('/api/admin/patterns/:id', requireAdminSession, requireCsrf, async (req, res) => {
  const pattern = await updatePattern(req.params.id, req.body || {});
  if (!pattern) {
    return res.status(404).json({ ok: false, message: 'Pattern not found.' });
  }
  res.json({ ok: true, pattern });
});

app.delete('/api/admin/patterns/:id', requireAdminSession, requireCsrf, async (req, res) => {
  await deletePattern(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/portfolio', requireAdminSession, async (req, res) => {
  res.json({ ok: true, portfolio: await listPortfolio() });
});

app.post('/api/admin/portfolio', requireAdminSession, requireCsrf, async (req, res) => {
  const item = await createPortfolioItem(req.body || {});
  res.status(201).json({ ok: true, item });
});

app.put('/api/admin/portfolio/:id', requireAdminSession, requireCsrf, async (req, res) => {
  const item = await updatePortfolioItem(req.params.id, req.body || {});
  if (!item) {
    return res.status(404).json({ ok: false, message: 'Portfolio item not found.' });
  }
  res.json({ ok: true, item });
});

app.delete('/api/admin/portfolio/:id', requireAdminSession, requireCsrf, async (req, res) => {
  await deletePortfolioItem(req.params.id);
  res.json({ ok: true });
});

app.get('/api/admin/orders', requireAdminSession, async (req, res) => {
  res.json({ ok: true, orders: await listOrders() });
});

app.get('/api/admin/bookings', requireAdminSession, async (req, res) => {
  res.json({ ok: true, bookings: await listBookings() });
});

app.get('/api/admin/contact', requireAdminSession, async (req, res) => {
  res.json({ ok: true, messages: await listContactMessages() });
});

app.post('/api/admin/change-password', requireAdminSession, requireCsrf, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = getAdminUserByEmail(req.session.admin.email);
  if (!user || !verifyAdminCredentials(user.email, currentPassword)) {
    return res.status(401).json({ ok: false, message: 'Current password is incorrect.' });
  }
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ ok: false, message: 'New password must be at least 8 characters.' });
  }
  setAdminPassword(user.email, newPassword);
  res.json({ ok: true, message: 'Password updated successfully.' });
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
