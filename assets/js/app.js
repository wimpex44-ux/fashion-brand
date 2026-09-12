let products = [];

async function loadData() {
  try {
    const [productRes, patternRes, portfolioRes] = await Promise.all([
      fetch('/api/products').then((response) => response.json()),
      fetch('/api/patterns').then((response) => response.json()),
      fetch('/api/portfolio').then((response) => response.json())
    ]);

    products = productRes.products || [];
    patterns = patternRes.patterns || [];
    portfolio = portfolioRes.portfolio || [];
  } catch (error) {
    products = [
      {
        id: 'solstice-tee',
        name: 'Solstice Tee',
    category: 'Tshirt',
    color: 'Rose',
    price: 118,
    originalPrice: 160,
    theme: { bg: '#f5dfe5', accent: '#c1547d', accent2: '#f8edf1' },
    sizes: ['XS','S','M','L','XL','2XL'],
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'A softly structured cotton tee cut for an effortless drape, with a sculpted neckline and refined finish for elevated everyday dressing.'
  },
  {
    id: 'lune-hoodie',
    name: 'Lune Hoodie',
    category: 'Hoodies',
    color: 'Ivory',
    price: 186,
    originalPrice: 230,
    theme: { bg: '#f4efe8', accent: '#9f7d5d', accent2: '#efe8db' },
    sizes: ['S','M','L','XL','2XL','3XL'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'An oversized hoodie designed in premium brushed fleece that feels contemporary yet timeless with a soft, casual silhouette.'
  },
  {
    id: 'atelier-sweat',
    name: 'Atelier Sweat',
    category: 'Sweatshirts',
    color: 'Stone',
    price: 168,
    originalPrice: 215,
    theme: { bg: '#e8e4df', accent: '#7d756d', accent2: '#f4f1ef' },
    sizes: ['S','M','L','XL','2XL'],
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'
    ],
    description: 'A refined everyday sweatshirt with a tailored fit, clean hems, and a weighty hand-feel that transforms a classic staple.'
      }
    ];

    patterns = [
      {
        id: 'milan-ruffle',
        name: 'Milan Ruffle Blouse',
    skill: 'Intermediate',
    price: 32,
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
    preview: ['https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80'],
    description: 'A romantic blouse pattern with soft draping and a sculptural collar, crafted for confident day-to-evening dressing.'
  },
  {
    id: 'noir-coat',
    name: 'Noir Wool Coat',
    skill: 'Advanced',
    price: 48,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
    preview: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80'],
    description: 'A structured coat with set-in sleeves and tailored lapels, designed for a polished silhouette with technique-driven finishing.'
  },
  {
    id: 'marais-dress',
    name: 'Marais Slip Dress',
    skill: 'Beginner',
    price: 28,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    preview: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'],
    description: 'A fluid, easy-to-sew slip dress with a dramatic hem and bias-cut drape, ideal for minimal wardrobes and statement layering.'
      }
    ];

    portfolio = [
      { title: 'Femme Atelier', category: 'Editorial', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Aubade Capsule', category: 'Collection', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Riverline', category: 'Campaign', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80' },
  { title: 'After Hours', category: 'Styling', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80' },
  { title: 'Palette Study', category: 'Collection', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80' },
      { title: 'Modern Tailor', category: 'Editorial', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80' }
    ];
  }
}

let patterns = [];

const heroState = { index: 0, size: 'XL' };

const page = document.body.dataset.page || 'home';

function getCart() {
  try { return JSON.parse(localStorage.getItem('maison-miro-cart') || '[]'); } catch (e) { return []; }
}

function saveCart(cart) { localStorage.setItem('maison-miro-cart', JSON.stringify(cart)); }

function addToCart(productId, qty = 1, size = 'M') {
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId && item.size === size);
  if (existing) { existing.qty += qty; }
  else { cart.push({ id: productId, size, qty }); }
  saveCart(cart);
  updateCartBadge();
  if (window.location.pathname.includes('cart.html')) { renderCart(); }
}

function updateCartBadge() {
  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach((node) => {
    node.textContent = total;
    node.classList.toggle('hidden', total === 0);
  });
}

function formatPrice(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }

function getProductById(id) { return products.find((product) => product.id === id); }

function getPatternById(id) { return patterns.find((pattern) => pattern.id === id); }

function renderHero() {
  if (!products.length) return;
  heroState.index = Math.min(heroState.index, products.length - 1);
  const heroProduct = products[heroState.index];
  const nextProduct = products[(heroState.index + 1) % products.length];
  const heroImage = document.querySelector('[data-hero-image]');
  const heroName = document.querySelector('[data-hero-name]');
  const heroPrice = document.querySelector('[data-hero-price]');
  const heroOriginal = document.querySelector('[data-hero-original]');
  const heroSizes = document.querySelector('[data-hero-sizes]');
  const nextPreviewImg = document.querySelector('[data-next-thumbnail]');
  const nextPreviewText = document.querySelector('[data-next-title]');
  const dots = [...document.querySelectorAll('[data-slide-dot]')];
  const root = document.documentElement;
  if (!heroProduct) return;

  root.style.setProperty('--bg', heroProduct.theme.bg);
  root.style.setProperty('--accent', heroProduct.theme.accent);
  root.style.setProperty('--panel-soft', heroProduct.theme.accent2);

  if (heroImage) heroImage.src = heroProduct.image;
  if (heroName) heroName.textContent = heroProduct.name;
  if (heroPrice) heroPrice.textContent = formatPrice(heroProduct.price);
  if (heroOriginal) heroOriginal.textContent = formatPrice(heroProduct.originalPrice);
  if (nextPreviewImg) nextPreviewImg.src = nextProduct.image;
  if (nextPreviewText) nextPreviewText.textContent = nextProduct.name;
  if (heroSizes) {
    heroSizes.innerHTML = '';
    heroProduct.sizes.forEach((size) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'size-pill' + (size === heroState.size ? ' active' : '');
      button.textContent = size;
      button.addEventListener('click', () => {
        heroState.size = size;
        renderHero();
      });
      heroSizes.appendChild(button);
    });
  }
  dots.forEach((dot, idx) => dot.classList.toggle('active', idx === heroState.index));

  const prevButton = document.querySelector('[data-prev-slide]');
  const nextButton = document.querySelector('[data-next-slide]');
  if (prevButton) prevButton.onclick = () => { heroState.index = (heroState.index - 1 + products.length) % products.length; renderHero(); };
  if (nextButton) nextButton.onclick = () => { heroState.index = (heroState.index + 1) % products.length; renderHero(); };
}

function renderFeaturedHome() {
  const featuredProducts = document.querySelector('[data-featured-products]');
  const featuredPatterns = document.querySelector('[data-featured-patterns]');

  if (featuredProducts) {
    const items = products.slice(0, 3);
    featuredProducts.innerHTML = items.length
      ? items.map((product) => `
        <article class="product-card">
          <div class="media"><img src="${product.image}" alt="${product.name}"></div>
          <div class="body">
            <div class="meta"><span class="tag">${product.category}</span><span class="tag">${product.color}</span></div>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="price-line"><strong>${formatPrice(product.price)}</strong><span style="color: var(--muted); text-decoration: line-through;">${formatPrice(product.originalPrice)}</span></div>
            <div class="product-actions"><a class="btn-small primary" href="product.html?id=${product.id}">View</a><button class="btn-small" type="button" data-add-product="${product.id}">Add to cart</button></div>
          </div>
        </article>
      `).join('')
      : '<p class="description">Featured products will appear here once the studio catalog is loaded.</p>';
  }

  if (featuredPatterns) {
    const items = patterns.slice(0, 3);
    featuredPatterns.innerHTML = items.length
      ? items.map((pattern) => `
        <article class="pattern-card">
          <div class="media"><img src="${pattern.image}" alt="${pattern.name}"></div>
          <div class="body">
            <div class="meta"><span class="tag">${pattern.skill}</span><span class="tag">${formatPrice(pattern.price)}</span></div>
            <h3>${pattern.name}</h3>
            <p>${pattern.description}</p>
            <div class="product-actions"><a class="btn-small primary" href="pattern-detail.html?id=${pattern.id}">Preview</a><button class="btn-small" type="button" data-buy-pattern="${pattern.id}">Buy & download</button></div>
          </div>
        </article>
      `).join('')
      : '<p class="description">Signature patterns will appear here when they are available.</p>';
  }

  document.querySelectorAll('[data-add-product]').forEach((button) => {
    button.onclick = () => {
      addToCart(button.dataset.addProduct, 1, 'M');
      button.textContent = 'Added';
      setTimeout(() => { button.textContent = 'Add to cart'; }, 1000);
    };
  });

  document.querySelectorAll('[data-buy-pattern]').forEach((button) => {
    button.onclick = () => {
      window.location.href = `pattern-detail.html?id=${button.dataset.buyPattern}`;
    };
  });
}

function renderProductGrid() {
  const grid = document.querySelector('[data-product-grid]');
  if (!grid) return;
  const filters = document.querySelectorAll('.filter-pill');
  const category = document.querySelector('[data-category-filter]')?.value || 'all';
  const sort = document.querySelector('[data-sort-filter]')?.value || 'featured';

  if (!products.length) {
    grid.innerHTML = '<p class="description">No products are available in the current collection.</p>';
    return;
  }

  let items = [...products];
  if (category !== 'all') items = items.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  if (sort === 'low') items.sort((a,b) => a.price - b.price);
  if (sort === 'high') items.sort((a,b) => b.price - a.price);

  grid.innerHTML = items.map((product) => `
    <article class="product-card">
      <div class="media">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="body">
        <div class="meta">
          <span class="tag">${product.category}</span>
          <span class="tag">${product.color}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price-line">
          <strong>${formatPrice(product.price)}</strong>
          <span style="color: var(--muted); text-decoration: line-through;">${formatPrice(product.originalPrice)}</span>
        </div>
        <div class="product-actions">
          <a class="btn-small primary" href="product.html?id=${product.id}">View</a>
          <button class="btn-small" type="button" data-add-product="${product.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join('');

  filters.forEach((pill) => {
    pill.classList.toggle('active', pill.dataset.filter === category || (category === 'all' && pill.dataset.filter === 'all'));
    pill.onclick = () => {
      const selector = document.querySelector('[data-category-filter]');
      if (selector) selector.value = pill.dataset.filter;
      renderProductGrid();
    };
  });

  document.querySelectorAll('[data-add-product]').forEach((button) => {
    button.onclick = () => {
      const productId = button.dataset.addProduct;
      addToCart(productId, 1, 'M');
      button.textContent = 'Added';
      setTimeout(() => { button.textContent = 'Add to cart'; }, 1000);
    };
  });
}

function renderPatternGrid() {
  const grid = document.querySelector('[data-pattern-grid]');
  if (!grid) return;
  if (!patterns.length) {
    grid.innerHTML = '<p class="description">No patterns are available right now.</p>';
    return;
  }
  grid.innerHTML = patterns.map((pattern) => `
    <article class="pattern-card">
      <div class="media"><img src="${pattern.image}" alt="${pattern.name}"></div>
      <div class="body">
        <div class="meta"><span class="tag">${pattern.skill}</span><span class="tag">PDF</span></div>
        <h3>${pattern.name}</h3>
        <p>${pattern.description}</p>
        <div class="price-line"><strong>${formatPrice(pattern.price)}</strong></div>
        <div class="product-actions">
          <a class="btn-small primary" href="pattern-detail.html?id=${pattern.id}">Preview</a>
          <button class="btn-small" type="button" data-buy-pattern="${pattern.id}">Buy & download</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('[data-buy-pattern]').forEach((button) => {
    button.onclick = () => {
      window.location.href = `pattern-detail.html?id=${button.dataset.buyPattern}`;
    };
  });
}

function renderProductDetail() {
  const detail = document.querySelector('[data-product-detail]');
  if (!detail) return;
  if (!products.length) {
    detail.innerHTML = '<p class="description">This product is unavailable at the moment.</p>';
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get('id') || products[0].id);
  if (!product) return;

  detail.innerHTML = `
    <div class="product-detail-grid">
      <div>
        <div class="gallery-main">
          <img src="${product.gallery[0]}" alt="${product.name}" data-main-image>
        </div>
        <div class="gallery-thumbs">
          ${product.gallery.map((image, idx) => `<img class="${idx === 0 ? 'active' : ''}" src="${image}" alt="${product.name} thumbnail ${idx + 1}" data-thumb="${image}">`).join('')}
        </div>
      </div>
      <aside class="detail-panel">
        <div class="meta-row"><span class="tag">${product.category}</span><span class="tag">${product.color}</span></div>
        <h1>${product.name}</h1>
        <div class="price-line"><strong>${formatPrice(product.price)}</strong><span style="color: var(--muted); text-decoration: line-through;">${formatPrice(product.originalPrice)}</span></div>
        <p class="description">${product.description}</p>
        <div style="margin-top: 20px;">
          <div class="label">Choose your size</div>
          <div class="size-selector" data-size-selector>
            ${product.sizes.map((size) => `<button type="button" class="size-pill ${size === 'XL' ? 'active' : ''}" data-size="${size}">${size}</button>`).join('')}
          </div>
        </div>
        <div class="detail-cta">
          <div class="quantity-control">
            <button type="button" data-decrease-qty>−</button>
            <span class="quantity-value" data-qty>1</span>
            <button type="button" data-increase-qty>+</button>
          </div>
          <button class="btn btn-primary" type="button" data-add-detail> Add to cart </button>
        </div>
        <div class="inline-list"><span>Premium Cotton</span><span>Tailored Fit</span><span>Limited Run</span></div>
      </aside>
    </div>
  `;

  let qty = 1; let selectedSize = 'XL';
  const qtyNode = document.querySelector('[data-qty]');
  document.querySelector('[data-decrease-qty]').onclick = () => { qty = Math.max(1, qty - 1); qtyNode.textContent = qty; };
  document.querySelector('[data-increase-qty]').onclick = () => { qty = qty + 1; qtyNode.textContent = qty; };
  document.querySelectorAll('[data-size]').forEach((button) => {
    button.onclick = () => {
      selectedSize = button.dataset.size; 
      document.querySelectorAll('[data-size]').forEach((item) => item.classList.toggle('active', item.dataset.size === selectedSize));
    };
  });
  document.querySelector('[data-add-detail]').onclick = () => {
    addToCart(product.id, qty, selectedSize);
    window.location.href = 'cart.html';
  };
  document.querySelectorAll('[data-thumb]').forEach((thumb) => {
    thumb.onclick = () => {
      document.querySelector('[data-main-image]').src = thumb.dataset.thumb;
      document.querySelectorAll('[data-thumb]').forEach((node) => node.classList.toggle('active', node.dataset.thumb === thumb.dataset.thumb));
    };
  });
}

function renderPatternDetail() {
  const detail = document.querySelector('[data-pattern-detail]');
  if (!detail) return;
  if (!patterns.length) {
    detail.innerHTML = '<p class="description">This pattern is not available right now.</p>';
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const pattern = getPatternById(params.get('id') || patterns[0].id);
  if (!pattern) return;

  detail.innerHTML = `
    <div class="product-detail-grid">
      <div>
        <div class="gallery-main"><img src="${pattern.preview[0]}" alt="${pattern.name}" data-main-pattern></div>
        <div class="gallery-thumbs">
          ${pattern.preview.map((image, idx) => `<img class="${idx === 0 ? 'active' : ''}" src="${image}" alt="${pattern.name} preview ${idx + 1}" data-pattern-thumb="${image}">`).join('')}
        </div>
      </div>
      <aside class="detail-panel">
        <div class="meta-row"><span class="tag">${pattern.skill}</span><span class="tag">Digital download</span></div>
        <h1>${pattern.name}</h1>
        <div class="price-line"><strong>${formatPrice(pattern.price)}</strong></div>
        <p class="description">${pattern.description}</p>
        <div class="detail-cta">
          <button class="btn btn-primary" type="button" data-buy-pattern-download>Buy & download</button>
        </div>
        <div class="inline-list"><span>PDF pattern</span><span>Print at home</span><span>Includes instructions</span></div>
      </aside>
    </div>
  `;

  document.querySelector('[data-pattern-thumb]')?.addEventListener('click', () => {});
  document.querySelectorAll('[data-pattern-thumb]').forEach((thumb) => {
    thumb.onclick = () => {
      document.querySelector('[data-main-pattern]').src = thumb.dataset.patternThumb;
      document.querySelectorAll('[data-pattern-thumb]').forEach((node) => node.classList.toggle('active', node.dataset.patternThumb === thumb.dataset.patternThumb));
    };
  });

  document.querySelector('[data-buy-pattern-download]').onclick = async () => {
    try {
      const response = await fetch('/api/patterns/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patternId: pattern.id, patternName: pattern.name })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to complete pattern purchase');
      localStorage.setItem('maison-miro-download-link', JSON.stringify(data));
      window.location.href = 'confirmation.html?type=pattern&pattern=' + encodeURIComponent(pattern.name) + '&download=' + encodeURIComponent(window.location.origin + data.downloadUrl);
    } catch (error) {
      alert(error.message || 'Unable to complete purchase. Please try again.');
    }
  };
}

function renderCart() {
  const cart = getCart();
  const itemsContainer = document.querySelector('[data-cart-items]');
  const summary = document.querySelector('[data-cart-summary]');
  if (!itemsContainer || !summary) return;

  if (!cart.length) {
    itemsContainer.innerHTML = '<p class="description">Your cart is empty. Add a piece to begin.</p>';
    summary.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(0)}</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>Calculated at checkout</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${formatPrice(0)}</strong></div>
    `;
    return;
  }

  const productItems = cart.map((item) => { const product = getProductById(item.id); return { ...item, product }; }).filter((item) => item.product);
  const subtotal = productItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  itemsContainer.innerHTML = productItems.map((item) => `
    <div class="order-item" style="margin-bottom: 18px;">
      <img src="${item.product.image}" alt="${item.product.name}">
      <div>
        <h4 style="margin: 0;">${item.product.name}</h4>
        <div style="color: var(--muted); font-size: 0.9rem;">Size: ${item.size} · Qty: ${item.qty}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 700;">${formatPrice(item.product.price * item.qty)}</div>
        <button class="btn-small" data-remove-item="${item.id}" data-remove-size="${item.size}">Remove</button>
      </div>
    </div>
  `).join('');

  summary.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>Calculated at checkout</strong></div>
    <div class="summary-row total"><span>Total</span><strong>${formatPrice(subtotal)}</strong></div>
    <div style="margin-top: 18px; display:flex; gap: 10px;">
      <input type="text" placeholder="Promo code (optional)" aria-label="Promo code">
      <button class="btn-small primary" type="button">Apply</button>
    </div>
    <a class="btn btn-primary" href="checkout.html" style="width:100%; margin-top:20px;">Checkout</a>
  `;

  document.querySelectorAll('[data-remove-item]').forEach((button) => {
    button.onclick = () => {
      const cartItems = getCart();
      const updated = cartItems.filter((item) => !(item.id === button.dataset.removeItem && item.size === button.dataset.removeSize));
      saveCart(updated);
      renderCart();
      updateCartBadge();
    };
  });
}

function renderCheckout() {
  const cart = getCart();
  const summary = document.querySelector('[data-checkout-summary]');
  if (!summary) return;
  if (!cart.length) {
    summary.innerHTML = '<p class="description">No items in cart. <a href="shop.html">Browse the collection</a>.</p>';
    return;
  }

  const items = cart.map((item) => { const product = getProductById(item.id); return { ...item, product }; }).filter((item) => item.product);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shipping = subtotal > 180 ? 0 : 18;
  const total = subtotal + shipping;

  summary.innerHTML = `
    <ul class="order-list">
      ${items.map((item) => `
        <li class="order-item">
          <img src="${item.product.image}" alt="${item.product.name}">
          <div>
            <strong>${item.product.name}</strong><br>
            <span style="color: var(--muted); font-size: 0.82rem;">${item.size} · Qty ${item.qty}</span>
          </div>
          <strong>${formatPrice(item.product.price * item.qty)}</strong>
        </li>
      `).join('')}
    </ul>
    <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
    <div class="summary-row"><span>Shipping</span><strong>${shipping === 0 ? 'Free' : formatPrice(shipping)}</strong></div>
    <div class="summary-row total"><span>Total</span><strong>${formatPrice(total)}</strong></div>
    <div class="payment-box">
      <div class="label">Payment</div>
      <div class="checkline"><span>Stripe secure checkout</span><span>🔒</span></div>
      <button class="btn btn-primary" type="button" data-stripe-pay style="width:100%; margin-top:18px;">Pay ${formatPrice(total)}</button>
    </div>
  `;

  document.querySelector('[data-stripe-pay]').onclick = async () => {
    const firstName = document.querySelector('#firstName')?.value || 'Client';
    const email = document.querySelector('#email')?.value || 'hello@example.com';

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { firstName, email },
          items,
          total,
          shipping
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to process payment');

      localStorage.setItem('maison-miro-order', JSON.stringify({
        orderId: data.order.id,
        customer: { firstName, email },
        total,
        items,
        date: new Date().toISOString(),
        shipping,
        status: 'Paid'
      }));
      saveCart([]);
      window.location.href = 'confirmation.html?type=order&order=' + data.order.id;
    } catch (error) {
      alert(error.message || 'Unable to process payment. Please try again.');
    }
  };
}

function renderConfirmation() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') || 'order';
  const container = document.querySelector('[data-confirmation]');
  if (!container) return;

  if (type === 'pattern') {
    const patternName = params.get('pattern') || 'Pattern';
    const link = params.get('download') || 'https://secure.maisonmiro.com/download/pattern';
    container.innerHTML = `
      <div class="success-box">
        <div class="label">Payment successful</div>
        <h2 style="margin-top: 8px;">Your pattern is ready</h2>
        <p class="description">${patternName} has been added to your secure library. The link below is private and expires after 48 hours.</p>
      </div>
      <div class="download-list">
        <div class="download-item">
          <span>${patternName} PDF</span>
          <a class="btn-small primary" href="${link}" target="_blank" rel="noreferrer">Download</a>
        </div>
      </div>
    `;
    return;
  }

  const order = JSON.parse(localStorage.getItem('maison-miro-order') || '{}');
  const customer = order.customer || { firstName: 'Customer', email: 'hello@example.com' };
  container.innerHTML = `
    <div class="success-box">
      <div class="label">Order confirmed</div>
      <h2 style="margin-top: 8px;">Thank you, ${customer.firstName}</h2>
      <p class="description">Your order #${order.orderId || 'N/A'} has been paid and is now being prepared. A receipt was sent to ${customer.email}.</p>
    </div>
    <div class="grid-two">
      <div class="summary-panel">
        <h3>Delivery summary</h3>
        <p class="description">Tracking details will be shared as soon as the studio dispatches your order. Domestic fulfillment typically ships within 2-3 business days.</p>
      </div>
      <div class="summary-panel">
        <h3>Order total</h3>
        <div class="summary-row"><span>Items</span><strong>${order.items ? order.items.length : 0}</strong></div>
        <div class="summary-row"><span>Shipping</span><strong>${order.shipping === 0 ? 'Free' : formatPrice(order.shipping || 0)}</strong></div>
        <div class="summary-row total"><span>Total</span><strong>${formatPrice(order.total || 0)}</strong></div>
      </div>
    </div>
  `;
}

function renderPortfolio() {
  const grid = document.querySelector('[data-portfolio-grid]');
  if (!grid) return;
  if (!portfolio.length) {
    grid.innerHTML = '<p class="description">The lookbook is being refreshed.</p>';
    return;
  }
  grid.innerHTML = portfolio.map((entry, idx) => `
    <article class="portfolio-card">
      <img src="${entry.image}" alt="${entry.title}" data-open-lightbox="${idx}">
      <div class="body"><h3>${entry.title}</h3><p>${entry.category}</p></div>
    </article>
  `).join('');

  document.querySelectorAll('[data-open-lightbox]').forEach((card) => {
    card.onclick = () => {
      const idx = Number(card.dataset.openLightbox);
      const item = portfolio[idx];
      const lightbox = document.querySelector('[data-lightbox]');
      if (!lightbox) return;
      lightbox.classList.add('open');
      lightbox.querySelector('img').src = item.image;
      lightbox.querySelector('[data-lightbox-caption]').textContent = `${item.title} · ${item.category}`;
    };
  });
}

function initBookingForm() {
  const input = document.querySelector('[data-booking-date]');
  if (!input) return;
  const now = new Date();
  const minDate = now.toISOString().split('T')[0];
  input.min = minDate;
}

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function handleForms() {
  const forms = document.querySelectorAll('[data-ajax-form]');
  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const notice = form.querySelector('[data-form-message]');
      const formData = Object.fromEntries(new FormData(form).entries());

      try {
        let endpoint = '/api/contact';
        if (form.closest('body')?.dataset.page === 'book') {
          endpoint = '/api/bookings';
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Submission failed.');
        if (notice) {
          notice.textContent = 'Thanks — your request has been received. The studio will follow up within 1–2 business days.';
        }
        form.reset();
      } catch (error) {
        if (notice) {
          notice.textContent = error.message || 'Submission failed. Please try again.';
        }
      }
    });
  });
}

function buildAdminTable(selector, rows) {
  const table = document.querySelector(selector);
  if (!table) return;
  table.innerHTML = rows.map((row) => row).join('');
}

async function initPage() {
  await loadData();
  initMobileMenu();
  updateCartBadge();
  renderFeaturedHome();
  renderHero();
  renderProductGrid();
  renderPatternGrid();
  renderProductDetail();
  renderPatternDetail();
  renderCart();
  renderCheckout();
  renderConfirmation();
  renderPortfolio();
  initBookingForm();
  handleForms();

  const lightbox = document.querySelector('[data-lightbox]');
  if (lightbox) {
    lightbox.onclick = (event) => {
      if (event.target === lightbox || event.target.closest('[data-close-lightbox]')) {
        lightbox.classList.remove('open');
      }
    };
  }
}

window.addEventListener('DOMContentLoaded', initPage);
