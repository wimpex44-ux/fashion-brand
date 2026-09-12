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

async function uploadImageFile(file) {
  if (!file) return '';
  const formData = new FormData();
  formData.append('image', file);
  const csrfToken = await getCsrfToken();
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: formData,
    credentials: 'include',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Upload failed.');
  return data.url || '';
}

async function uploadImageFiles(files) {
  const urls = [];
  for (const file of Array.from(files || [])) {
    const url = await uploadImageFile(file);
    if (url) urls.push(url);
  }
  return urls;
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function populateProducts() {
  apiFetch('/api/admin/products')
    .then((payload) => {
      renderTable(payload.products || [], '[data-product-table]', (product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>$${Number(product.price || 0).toFixed(2)}</td>
          <td>${(product.sizes || []).join(', ') || '—'}</td>
          <td><span class="status-pill status-paid">Live</span></td>
          <td>
            <button class="btn-small" type="button" data-edit-product="${product.id}">Edit</button>
            <button class="btn-small" type="button" data-delete-product="${product.id}">Delete</button>
          </td>
        </tr>
      `);

      document.querySelectorAll('[data-edit-product]').forEach((button) => {
        button.addEventListener('click', () => {
          const product = (payload.products || []).find((item) => item.id === button.dataset.editProduct);
          if (!product) return;
          const form = document.querySelector('[data-product-form]');
          if (!form) return;
          form.elements.id.value = product.id;
          form.elements.name.value = product.name || '';
          form.elements.category.value = product.category || '';
          form.elements.color.value = product.color || '';
          form.elements.price.value = Number(product.price || 0);
          form.elements.originalPrice.value = Number(product.originalPrice || product.price || 0);
          form.elements.sizes.value = Array.isArray(product.sizes) ? product.sizes.join(', ') : '';
          form.elements.description.value = product.description || '';
          form.elements.image.value = product.image || '';
          form.elements.gallery.value = Array.isArray(product.gallery) ? product.gallery.join(', ') : '';
          document.querySelector('[data-product-form-title]').textContent = 'Edit product';
        });
      });

      document.querySelectorAll('[data-delete-product]').forEach((button) => {
        button.addEventListener('click', async () => {
          const confirmed = window.confirm('Delete this product?');
          if (!confirmed) return;
          try {
            await apiFetch(`/api/admin/products/${button.dataset.deleteProduct}`, { method: 'DELETE' });
            populateProducts();
          } catch (error) {
            window.alert(error.message || 'Unable to delete product.');
          }
        });
      });
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
          <td>${(pattern.preview || []).length}</td>
          <td>
            <button class="btn-small" type="button" data-edit-pattern="${pattern.id}">Edit</button>
            <button class="btn-small" type="button" data-delete-pattern="${pattern.id}">Delete</button>
          </td>
        </tr>
      `);

      document.querySelectorAll('[data-edit-pattern]').forEach((button) => {
        button.addEventListener('click', () => {
          const pattern = (payload.patterns || []).find((item) => item.id === button.dataset.editPattern);
          if (!pattern) return;
          const form = document.querySelector('[data-pattern-form]');
          if (!form) return;
          form.elements.id.value = pattern.id;
          form.elements.name.value = pattern.name || '';
          form.elements.skill.value = pattern.skill || 'Beginner';
          form.elements.price.value = Number(pattern.price || 0);
          form.elements.description.value = pattern.description || '';
          form.elements.image.value = pattern.image || '';
          form.elements.preview.value = Array.isArray(pattern.preview) ? pattern.preview.join(', ') : '';
          document.querySelector('[data-pattern-form-title]').textContent = 'Edit pattern';
        });
      });

      document.querySelectorAll('[data-delete-pattern]').forEach((button) => {
        button.addEventListener('click', async () => {
          const confirmed = window.confirm('Delete this pattern?');
          if (!confirmed) return;
          try {
            await apiFetch(`/api/admin/patterns/${button.dataset.deletePattern}`, { method: 'DELETE' });
            populatePatterns();
          } catch (error) {
            window.alert(error.message || 'Unable to delete pattern.');
          }
        });
      });
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
          <td><img src="${item.image || ''}" alt="${item.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px;" /></td>
          <td>
            <button class="btn-small" type="button" data-edit-portfolio="${item.id}">Edit</button>
            <button class="btn-small" type="button" data-delete-portfolio="${item.id}">Delete</button>
          </td>
        </tr>
      `);

      document.querySelectorAll('[data-edit-portfolio]').forEach((button) => {
        button.addEventListener('click', () => {
          const item = (payload.portfolio || []).find((entry) => entry.id === button.dataset.editPortfolio);
          if (!item) return;
          const form = document.querySelector('[data-portfolio-form]');
          if (!form) return;
          form.elements.id.value = item.id;
          form.elements.title.value = item.title || '';
          form.elements.category.value = item.category || 'Editorial';
          form.elements.image.value = item.image || '';
          document.querySelector('[data-portfolio-form-title]').textContent = 'Edit portfolio item';
        });
      });

      document.querySelectorAll('[data-delete-portfolio]').forEach((button) => {
        button.addEventListener('click', async () => {
          const confirmed = window.confirm('Delete this portfolio item?');
          if (!confirmed) return;
          try {
            await apiFetch(`/api/admin/portfolio/${button.dataset.deletePortfolio}`, { method: 'DELETE' });
            populatePortfolio();
          } catch (error) {
            window.alert(error.message || 'Unable to delete portfolio item.');
          }
        });
      });
    })
    .catch((error) => {
      document.body.insertAdjacentHTML('beforeend', `<div class="notice error">${error.message}</div>`);
    });
}

async function bindProductForm() {
  const form = document.querySelector('[data-product-form]');
  if (!form) return;
  const message = form.querySelector('[data-form-message]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      id: formData.get('id') || undefined,
      name: String(formData.get('name') || '').trim(),
      category: String(formData.get('category') || '').trim(),
      color: String(formData.get('color') || '').trim(),
      price: Number(formData.get('price') || 0),
      originalPrice: Number(formData.get('originalPrice') || formData.get('price') || 0),
      sizes: parseList(formData.get('sizes')),
      description: String(formData.get('description') || '').trim(),
      image: String(formData.get('image') || '').trim(),
      gallery: parseList(formData.get('gallery')),
    };

    try {
      const mainFile = formData.get('imageFile');
      if (mainFile && mainFile.size) {
        payload.image = await uploadImageFile(mainFile);
      }
      const uploadedGallery = await uploadImageFiles(formData.getAll('galleryFiles'));
      if (uploadedGallery.length) {
        payload.gallery = [...payload.gallery, ...uploadedGallery];
      }
      if (!payload.image && payload.gallery.length) payload.image = payload.gallery[0];
      if (payload.id) {
        await apiFetch(`/api/admin/products/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) });
      }
      form.reset();
      document.querySelector('[data-product-form-title]').textContent = 'Add new product';
      if (message) message.textContent = 'Product saved successfully.';
      populateProducts();
    } catch (error) {
      if (message) message.textContent = error.message || 'Unable to save product.';
    }
  });

  document.querySelector('[data-product-cancel]')?.addEventListener('click', () => {
    form.reset();
    document.querySelector('[data-product-form-title]').textContent = 'Add new product';
    if (message) message.textContent = '';
  });
}

async function bindPatternForm() {
  const form = document.querySelector('[data-pattern-form]');
  if (!form) return;
  const message = form.querySelector('[data-form-message]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      id: formData.get('id') || undefined,
      name: String(formData.get('name') || '').trim(),
      skill: String(formData.get('skill') || '').trim(),
      price: Number(formData.get('price') || 0),
      description: String(formData.get('description') || '').trim(),
      image: String(formData.get('image') || '').trim(),
      preview: parseList(formData.get('preview')),
    };

    try {
      const mainFile = formData.get('imageFile');
      if (mainFile && mainFile.size) {
        payload.image = await uploadImageFile(mainFile);
      }
      const uploadedPreviews = await uploadImageFiles(formData.getAll('previewFiles'));
      if (uploadedPreviews.length) {
        payload.preview = [...payload.preview, ...uploadedPreviews];
      }
      if (!payload.image && payload.preview.length) payload.image = payload.preview[0];
      if (payload.id) {
        await apiFetch(`/api/admin/patterns/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/api/admin/patterns', { method: 'POST', body: JSON.stringify(payload) });
      }
      form.reset();
      document.querySelector('[data-pattern-form-title]').textContent = 'Add new pattern';
      if (message) message.textContent = 'Pattern saved successfully.';
      populatePatterns();
    } catch (error) {
      if (message) message.textContent = error.message || 'Unable to save pattern.';
    }
  });

  document.querySelector('[data-pattern-cancel]')?.addEventListener('click', () => {
    form.reset();
    document.querySelector('[data-pattern-form-title]').textContent = 'Add new pattern';
    if (message) message.textContent = '';
  });
}

async function bindPortfolioForm() {
  const form = document.querySelector('[data-portfolio-form]');
  if (!form) return;
  const message = form.querySelector('[data-form-message]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      id: formData.get('id') || undefined,
      title: String(formData.get('title') || '').trim(),
      category: String(formData.get('category') || '').trim(),
      image: String(formData.get('image') || '').trim(),
    };

    try {
      const mainFile = formData.get('imageFile');
      if (mainFile && mainFile.size) {
        payload.image = await uploadImageFile(mainFile);
      }
      if (payload.id) {
        await apiFetch(`/api/admin/portfolio/${payload.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiFetch('/api/admin/portfolio', { method: 'POST', body: JSON.stringify(payload) });
      }
      form.reset();
      document.querySelector('[data-portfolio-form-title]').textContent = 'Add new portfolio item';
      if (message) message.textContent = 'Portfolio item saved successfully.';
      populatePortfolio();
    } catch (error) {
      if (message) message.textContent = error.message || 'Unable to save portfolio item.';
    }
  });

  document.querySelector('[data-portfolio-cancel]')?.addEventListener('click', () => {
    form.reset();
    document.querySelector('[data-portfolio-form-title]').textContent = 'Add new portfolio item';
    if (message) message.textContent = '';
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
  bindProductForm();
}
if (page === 'patterns') {
  populatePatterns();
  bindPatternForm();
}
if (page === 'orders') {
  populateOrders();
}
if (page === 'bookings') {
  populateBookings();
}
if (page === 'portfolio') {
  populatePortfolio();
  bindPortfolioForm();
}
if (page === 'login') {
  handleLogin();
}
handleMediaUpload();
