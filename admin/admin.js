const page = document.body.dataset.page || 'dashboard';

async function getCsrfToken() {
  const storedToken = localStorage.getItem('maison-miro-csrf');
  if (storedToken) return storedToken;

  const response = await fetch('/api/csrf-token', { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.csrfToken) {
    throw new Error(data.message || 'Unable to load a valid CSRF token.');
  }

  localStorage.setItem('maison-miro-csrf', data.csrfToken);
  return data.csrfToken;
}

async function apiFetch(url, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = await getCsrfToken();
    requestHeaders['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers: requestHeaders,
    credentials: 'include',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  if (data.csrfToken) {
    localStorage.setItem('maison-miro-csrf', data.csrfToken);
  }
  return data;
}

function renderSummary(summary) {
  const cards = document.querySelectorAll('[data-kpi]');
  if (!cards.length) return;

  const values = {
    revenue: summary.revenue || 0,
    orders: summary.orders || 0,
    bookings: summary.bookings || 0,
    downloads: summary.downloads || 0,
  };

  cards[0].textContent = `$${values.revenue.toLocaleString()}`;
  cards[1].textContent = String(values.orders);
  cards[2].textContent = String(values.bookings);
  cards[3].textContent = String(values.downloads);
}

function renderTable(rows, selector, formatter) {
  const tableBody = document.querySelector(selector);
  if (!tableBody) return;
  tableBody.innerHTML = rows.length ? rows.map(formatter).join('') : '<tr><td colspan="100%">No records yet.</td></tr>';
}

function populateDashboard() {
  apiFetch('/api/admin/summary')
    .then((summary) => renderSummary(summary))
    .catch((error) => {
      document.body.insertAdjacentHTML('beforeend', `<div class="notice error">${error.message}</div>`);
    });
}

function populateProducts() {
  apiFetch('/api/admin/products')
    .then((payload) => {
      renderTable(payload.products || [], '[data-product-table]', (product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>$${Number(product.price || 0).toFixed(2)}</td>
          <td>${product.sizes?.length || 0}</td>
          <td><span class="status-pill status-paid">Live</span></td>
        </tr>
      `);
    })
    .catch((error) => {
      document.body.insertAdjacentHTML('beforeend', `<div class="notice error">${error.message}</div>`);
    });
}

function populatePatterns() {
  apiFetch('/api/admin/patterns')
    .then((payload) => {
      renderTable(payload.patterns || [], '[data-pattern-table]', (pattern) => `
        <tr>
          <td>${pattern.name}</td>
          <td>${pattern.skill || 'Beginner'}</td>
          <td>$${Number(pattern.price || 0).toFixed(2)}</td>
          <td>${pattern.preview?.length || 0}</td>
          <td><span class="status-pill status-paid">Ready</span></td>
        </tr>
      `);
    })
    .catch((error) => {
      document.body.insertAdjacentHTML('beforeend', `<div class="notice error">${error.message}</div>`);
    });
}

function populateOrders() {
  apiFetch('/api/admin/orders')
    .then((payload) => {
      renderTable(payload.orders || [], '[data-order-table]', (order) => `
        <tr>
          <td>${order.id}</td>
          <td>${order.customer?.firstName || 'Guest'}</td>
          <td><span class="status-pill status-${(order.status || 'paid').toLowerCase()}">${order.status || 'Paid'}</span></td>
          <td>$${Number(order.total || 0).toFixed(2)}</td>
        </tr>
      `);
    })
    .catch((error) => {
      document.body.insertAdjacentHTML('beforeend', `<div class="notice error">${error.message}</div>`);
    });
}

function populateBookings() {
  apiFetch('/api/admin/bookings')
    .then((payload) => {
      renderTable(payload.bookings || [], '[data-booking-table]', (booking) => `
        <tr>
          <td>${booking.name || 'Guest'}</td>
          <td>${booking.email || '—'}</td>
          <td>${booking.date || '—'}</td>
          <td><span class="status-pill status-pending">${booking.status || 'Pending'}</span></td>
        </tr>
      `);
    })
    .catch((error) => {
      document.body.insertAdjacentHTML('beforeend', `<div class="notice error">${error.message}</div>`);
    });
}

function populatePortfolio() {
  apiFetch('/api/admin/portfolio')
    .then((payload) => {
      renderTable(payload.portfolio || [], '[data-portfolio-table]', (item) => `
        <tr>
          <td>${item.title}</td>
          <td>${item.category}</td>
          <td><img src="${item.image}" alt="${item.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px;" /></td>
        </tr>
      `);
    })
    .catch((error) => {
      document.body.insertAdjacentHTML('beforeend', `<div class="notice error">${error.message}</div>`);
    });
}

function handleLogin() {
  const form = document.querySelector('[data-admin-login-form]');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#adminEmail')?.value || '';
    const password = document.querySelector('#adminPass')?.value || '';
    const message = document.querySelector('[data-form-message]');

    try {
      const response = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (message) {
        message.textContent = 'Login successful — redirecting...';
      }
      if (response.csrfToken) {
        localStorage.setItem('maison-miro-csrf', response.csrfToken);
      }
      localStorage.setItem('maison-miro-admin', JSON.stringify(response.admin));
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    } catch (error) {
      if (message) {
        message.textContent = error.message;
      }
    }
  });
}

function handleMediaUpload() {
  const form = document.querySelector('[data-media-upload-form]');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fileInput = form.querySelector('input[type="file"]');
    const notice = form.querySelector('[data-upload-status]');
    if (!fileInput || !fileInput.files[0]) {
      if (notice) notice.textContent = 'Choose an image before uploading.';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      const csrfToken = await getCsrfToken();
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body: formData,
        credentials: 'include',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Upload failed.');
      if (notice) notice.textContent = `Uploaded: ${data.url}`;
      form.reset();
    } catch (error) {
      if (notice) notice.textContent = error.message;
    }
  });
}

if (page === 'dashboard') {
  populateDashboard();
}
if (page === 'products') {
  populateProducts();
}
if (page === 'patterns') {
  populatePatterns();
}
if (page === 'orders') {
  populateOrders();
}
if (page === 'bookings') {
  populateBookings();
}
if (page === 'portfolio') {
  populatePortfolio();
}
if (page === 'login') {
  handleLogin();
}
handleMediaUpload();
