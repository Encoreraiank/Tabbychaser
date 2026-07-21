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

// ---- INIT & DYNAMIC SUPABASE STOREFRONT LOADER ----
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const searchInput = document.getElementById('shopSearchInput');
  if (searchParam && searchInput) {
    searchInput.value = decodeURIComponent(searchParam);
  }
  filterProducts();

  // Try fetching products from Supabase DB live
  let tries = 0;
  while (!window.supabaseClient && tries < 10) {
    await new Promise(r => setTimeout(r, 200));
    tries++;
  }

  if (window.supabaseClient) {
    try {
      const { data: dbProducts } = await window.supabaseClient.from('products').select('*').eq('status', 'published');
      if (dbProducts && dbProducts.length > 0) {
        renderDynamicProducts(dbProducts);
      }
    } catch (err) {
      console.warn('Fallback to static products:', err);
    }
  }
});

function renderDynamicProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = products.map(p => {
    const img = (p.images && p.images[0]) ? p.images[0] : 'https://rjjympjfdmvjuuovidtc.supabase.co/storage/v1/object/public/product-images/50ce9ac9-ccac-42d0-bc0d-8f6b7868ee44/product-88b446e8-wa8nqo.webp';
    const catSlug = (p.category || 'charms').toLowerCase().replace(/\s+/g, '-');
    const stockStatus = p.stock > 3 ? 'in-stock' : (p.stock > 0 ? 'low-stock' : 'out-of-stock');
    const badgeHtml = p.badge ? `<span class="badge badge-best">${p.badge}</span>` : '';

    return `
      <div class="shop-card" data-cat="${catSlug}" data-price="${p.price}" data-stock="${stockStatus}" data-name="${p.name.replace(/"/g, '&quot;')}">
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

