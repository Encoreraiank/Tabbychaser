/* ==========================================================================
   Tabby Chaser – Shop Page JavaScript
   Filter, Sort, Cart, and Toast functionality
   ========================================================================== */

let currentCat = 'all';
let maxPrice = 600;
let cartCount = 0;
let toastTimeout = null;

// ---- CATEGORY FILTER ----
function setCat(btn, cat) {
  currentCat = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filterProducts();
}

// ---- PRICE SLIDER ----
function updatePriceFilter(val) {
  maxPrice = parseInt(val);
  document.getElementById('priceMax').textContent = '₹' + val;
  filterProducts();
}

// ---- MAIN FILTER + SORT ENGINE ----
function filterProducts() {
  const grid = document.getElementById('productsGrid');
  const cards = Array.from(grid.querySelectorAll('.shop-card'));
  const searchVal = (document.getElementById('shopSearchInput')?.value || '').toLowerCase().trim();
  const inStockOnly = document.getElementById('inStockOnly')?.checked || false;
  const sortVal = document.getElementById('sortSelect')?.value || 'default';

  // Step 1: Filter
  let visible = [];
  cards.forEach(card => {
    const cat = card.dataset.cat;
    const price = parseInt(card.dataset.price);
    const stock = card.dataset.stock;
    const name = card.dataset.name.toLowerCase();

    const catMatch = (currentCat === 'all') || (cat === currentCat);
    const priceMatch = price <= maxPrice;
    const stockMatch = !inStockOnly || (stock !== 'out-of-stock');
    const searchMatch = !searchVal || name.includes(searchVal);

    if (catMatch && priceMatch && stockMatch && searchMatch) {
      card.classList.remove('hidden');
      visible.push(card);
    } else {
      card.classList.add('hidden');
    }
  });

  // Step 2: Sort visible cards
  visible.sort((a, b) => {
    if (sortVal === 'price-asc') return parseInt(a.dataset.price) - parseInt(b.dataset.price);
    if (sortVal === 'price-desc') return parseInt(b.dataset.price) - parseInt(a.dataset.price);
    if (sortVal === 'name-asc') return a.dataset.name.localeCompare(b.dataset.name);
    return 0; // default/featured order
  });

  // Step 3: Re-append in sorted order
  visible.forEach(card => grid.appendChild(card));

  // Step 4: Update count
  document.getElementById('resultsNum').textContent = visible.length;

  // Step 5: Show/hide empty state
  const emptyState = document.getElementById('emptyState');
  if (emptyState) {
    emptyState.style.display = visible.length === 0 ? 'flex' : 'none';
  }
}

// ---- RESET FILTERS ----
function resetFilters() {
  currentCat = 'all';
  maxPrice = 600;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('.filter-btn[data-cat="all"]');
  if (allBtn) allBtn.classList.add('active');
  const slider = document.getElementById('priceSlider');
  if (slider) { slider.value = 600; }
  document.getElementById('priceMax').textContent = '₹600';
  const inStock = document.getElementById('inStockOnly');
  if (inStock) inStock.checked = false;
  const searchInput = document.getElementById('shopSearchInput');
  if (searchInput) searchInput.value = '';
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = 'default';
  filterProducts();
}

// ---- ADD TO CART ----
function addToCart(name, price) {
  // Find product image from the DOM
  let imgUrl = '';
  const cards = document.querySelectorAll('.shop-card');
  for (const card of cards) {
    if (card.dataset.name === name) {
      const img = card.querySelector('.shop-card-img');
      if (img) imgUrl = img.src;
      break;
    }
  }

  // Add to global cart drawer
  if (window.addGlobalCartItem) {
    window.addGlobalCartItem(name, price, imgUrl);
  }

  // Show toast notification
  showToast(`"${name}" added! (₹${price})`);
}

// ---- TOAST NOTIFICATION ----
function showToast(message) {
  const toast = document.getElementById('cartToast');
  const msg = document.getElementById('toastMsg');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ---- DYNAMIC STOREFRONT & CATEGORY ENGINE ----
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const searchInput = document.getElementById('shopSearchInput');
  if (searchParam && searchInput) {
    searchInput.value = decodeURIComponent(searchParam);
  }

  await loadLiveStorefrontData();
});

function cleanCategoryName(name) {
  if (!name) return '';
  return name.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim();
}

async function loadLiveStorefrontData() {
  let products = null;
  let remoteDeletedIds = [];

  // Wait for Supabase client
  let tries = 0;
  while (!window.supabaseClient && tries < 4) {
    await new Promise(r => setTimeout(r, 150));
    tries++;
  }

  // 1. Fetch live products and site settings from Supabase
  if (window.supabaseClient) {
    try {
      const { data: dbProducts } = await window.supabaseClient.from('products').select('*');
      if (dbProducts) {
        products = dbProducts;
        localStorage.setItem('tabby_products_local', JSON.stringify(dbProducts));
      }

      const { data: dbSettings } = await window.supabaseClient.from('site_settings').select('*');
      if (dbSettings) {
        const deletedRow = dbSettings.find(s => s.key === 'deleted_product_ids');
        if (deletedRow && deletedRow.value) {
          try { remoteDeletedIds = JSON.parse(deletedRow.value); } catch(e){}
        }
      }
    } catch (err) {
      console.warn('Supabase storefront fetch error:', err);
    }
  }

  // 2. Fallback to localStorage if offline
  if (products === null) {
    const local = localStorage.getItem('tabby_products_local');
    if (local !== null) {
      try { products = JSON.parse(local); } catch(e){}
    }
  }

  const localDeletedIds = JSON.parse(localStorage.getItem('tabby_deleted_product_ids') || '[]');
  const deletedIds = Array.from(new Set([...localDeletedIds, ...remoteDeletedIds]));
  localStorage.setItem('tabby_deleted_product_ids', JSON.stringify(deletedIds));

  const isInitialized = localStorage.getItem('tabby_products_initialized') === 'true';
  if (!isInitialized && (!products || products.length === 0) && typeof PRODUCTS_DATA !== 'undefined') {
    products = PRODUCTS_DATA.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      compare_price: p.compare_price || null,
      category: p.category || 'charms',
      stock: p.stock === 'out-of-stock' ? 0 : (p.stock === 'low-stock' ? 3 : 15),
      badge: p.badge || null,
      images: p.images || [p.image]
    }));
  }

  // Filter out any explicitly deleted products or draft status
  const liveProducts = (products || []).filter(p => p.status !== 'draft' && !deletedIds.includes(p.id) && !deletedIds.includes(p.name));

  // Render dynamic category pills & product cards
  renderDynamicCategoryPills(liveProducts);
  renderDynamicProducts(liveProducts);
}

function renderDynamicCategoryPills(liveProducts = []) {
  const container = document.getElementById('categoryFilter') || document.querySelector('.filter-scroll-track');
  if (!container) return;

  const localCats = JSON.parse(localStorage.getItem('tabby_categories_local') || '[]');
  const defaultCats = [
    { name: 'All Products', slug: 'all' },
    { name: 'Charms', slug: 'charms' },
    { name: 'Keychains', slug: 'keychains' },
    { name: 'Desk Pals', slug: 'desk-pals' },
    { name: 'Sticker Sheets', slug: 'stickers' },
    { name: 'Worry Stones', slug: 'worry-stones' },
    { name: 'Phone Charms', slug: 'phone-charms' }
  ];

  const merged = [...defaultCats];
  localCats.forEach(c => {
    const cleanName = cleanCategoryName(c.name);
    const slug = (c.slug || cleanName.toLowerCase().replace(/\s+/g, '-'));
    if (!merged.some(m => m.slug === slug)) {
      merged.push({ name: cleanName, slug: slug });
    }
  });

  container.innerHTML = merged.map((c, i) => {
    const cleanDisplayName = cleanCategoryName(c.name);
    const count = (c.slug === 'all') 
      ? liveProducts.length 
      : liveProducts.filter(p => (p.category || '').toLowerCase().replace(/\s+/g, '-') === c.slug).length;

    return `
      <li>
        <button class="filter-btn ${i === 0 ? 'active' : ''}" data-cat="${c.slug}" onclick="setCat(this, '${c.slug}')">
          ${cleanDisplayName} <span class="filter-count">${count}</span>
        </button>
      </li>
    `;
  }).join('');
}

function renderDynamicProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const wishlist = window.getWishlist ? window.getWishlist() : [];

  grid.innerHTML = products.map(p => {
    const img = (p.images && p.images[0]) ? p.images[0] : (p.image || 'https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-88b446e8-wa8nqo.webp');
    const catSlug = (p.category || 'charms').toLowerCase().replace(/\s+/g, '-');
    const stockStatus = (p.stock === 0 || p.stock === 'out-of-stock') ? 'out-of-stock' : ((p.stock <= 3 || p.stock === 'low-stock') ? 'low-stock' : 'in-stock');
    const badgeHtml = p.badge ? `<span class="badge badge-best">${p.badge}</span>` : '';
    const isWishlisted = wishlist.some(item => item.name === p.name);

    return `
      <div class="shop-card" data-cat="${catSlug}" data-price="${p.price}" data-stock="${stockStatus}" data-name="${p.name.replace(/"/g, '&quot;')}">
        <button class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" data-wishlist-name="${p.name.replace(/"/g, '&quot;')}" onclick="window.toggleWishlist('${p.id || ''}', '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${img}', event)" title="Add to Wishlist">
          ${isWishlisted ? '♥' : '♡'}
        </button>
        <a href="product.html?id=${p.id || ''}" class="shop-card-link">
          <div class="shop-card-img-wrap">
            ${badgeHtml}
            <img src="${img}" alt="${p.name}" class="shop-card-img" loading="lazy" />
            <div class="shop-card-hover-overlay">
              <span class="quick-view-btn">View Details 🔍</span>
            </div>
          </div>
          <div class="shop-card-meta">
            <span class="shop-card-cat">${p.category || 'Handmade'}</span>
            <h3 class="shop-card-title">${p.name}</h3>
            <div class="shop-card-price-row">
              <span class="price-current">₹${p.price}</span>
              ${p.compare_price ? `<span class="price-original">₹${p.compare_price}</span>` : ''}
            </div>
          </div>
        </a>
        <button class="add-to-cart-btn" onclick="addToCart('${p.name.replace(/'/g, "\\'")}', ${p.price})">
          🛒 Add to Bag
        </button>
      </div>
    `;
  }).join('');

  filterProducts();
}


