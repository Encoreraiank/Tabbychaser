// ==========================================================================
// Tabby Chaser E-Commerce Engine – v3
// Supabase is loaded via static <script> tags in each page's <head>.
// ==========================================================================


// ==========================================================================
// SLIDESHOW
// ==========================================================================
let currentSlideIdx = 0;
let slideInterval;
const totalSlides = 4;

function updateSlideshow(index) {
  const slidesWrapper = document.getElementById('slidesWrapper');
  const dotsContainer = document.getElementById('sliderDots');
  if (!slidesWrapper || !dotsContainer) return;
  slidesWrapper.querySelectorAll('.hero-slide').forEach((s, i) => s.classList.toggle('active', i === index));
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === index));
}
window.goToSlide = function (index) {
  currentSlideIdx = index;
  updateSlideshow(index);
  clearInterval(slideInterval);
  slideInterval = setInterval(() => { currentSlideIdx = (currentSlideIdx + 1) % totalSlides; updateSlideshow(currentSlideIdx); }, 5000);
};
function startAutoPlay() {
  slideInterval = setInterval(() => { currentSlideIdx = (currentSlideIdx + 1) % totalSlides; updateSlideshow(currentSlideIdx); }, 5000);
}

// ==========================================================================
// CART DRAWER – SELF-INJECTING (fixes timing issue permanently)
// ==========================================================================

function injectCartDrawer() {
  if (document.getElementById('cartDrawer')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cartDrawerOverlay';
  overlay.className = 'cart-drawer-overlay';
  overlay.onclick = () => window.toggleCartDrawer(false);
  document.body.appendChild(overlay);

  const drawer = document.createElement('div');
  drawer.id = 'cartDrawer';
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-drawer-header">
      <h2 class="cart-drawer-title">Shopping Bag 🛍️</h2>
      <button class="cart-drawer-close" onclick="window.toggleCartDrawer(false)">&times;</button>
    </div>
    <div class="cart-drawer-content" id="cartDrawerContent"></div>
    <div class="cart-drawer-footer">
      <div class="cart-summary-row"><span>Subtotal</span><span id="cartSubtotal">₹0</span></div>
      <div class="cart-summary-row" id="cartDiscountRow" style="display:none; color:#2e7d32; font-weight:600;">
        <span>Discount</span><span id="cartDiscount">-₹0</span>
      </div>
      <div class="cart-summary-row"><span>Shipping</span><span id="cartShipping">₹59</span></div>
      <div class="cart-summary-row total-row"><span>Total Estimate</span><span id="cartTotal">₹0</span></div>
      <div class="cart-marketing-text" id="cartMarketingText" style="display:none; font-size:0.8rem; color:#d35d88; text-align:center; margin-bottom:12px; font-weight:600; line-height:1.4; padding:10px; background:rgba(244,122,171,0.08); border-radius:10px !important;">
        🎁 Subscribe to our welcome gift to get 10% off on orders above ₹500!
      </div>
      <div style="display:flex; gap:6px; margin-bottom:12px;" id="cartCouponWrap">
        <input type="text" id="cartCouponInput" placeholder="Coupon Code (e.g. REVIEW50)" style="flex:1; border:1.5px solid #e8e0f0; border-radius:8px; padding:8px 10px; font-size:0.8rem; outline:none; text-transform:uppercase;" />
        <button type="button" onclick="window.applyCartCoupon()" style="padding:8px 12px; border:1px solid #ddd; background:#fff; border-radius:8px; font-size:0.78rem; font-weight:700; cursor:pointer;">Apply</button>
      </div>
      <button class="checkout-btn" onclick="window.triggerCheckout()">Proceed to Checkout ✨</button>
    </div>
  `;
  document.body.appendChild(drawer);

  // Global click listener for all cart buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cart-pill-btn') || e.target.closest('#cartBtn')) {
      e.preventDefault();
      window.toggleCartDrawer(true);
    }
  }, true); // Use capture phase to catch all events
}

// ==========================================================================
// CART DATA
// ==========================================================================

window.getCart = function () {
  try { return JSON.parse(localStorage.getItem('tabby_cart_items')) || []; } catch (e) { return []; }
};

window.getWishlist = function () {
  try { return JSON.parse(localStorage.getItem('tabby_wishlist_items')) || []; } catch (e) { return []; }
};

window.toggleWishlist = function (id, name, price, img) {
  if (!name) return;
  let list = window.getWishlist();
  const idx = list.findIndex(item => item.name === name);
  let isSaved;
  if (idx >= 0) {
    list.splice(idx, 1);
    isSaved = false;
  } else {
    list.push({ id: id || Date.now(), name, price: parseInt(price) || 0, img: img || '' });
    isSaved = true;
  }
  localStorage.setItem('tabby_wishlist_items', JSON.stringify(list));

  // Show toast instead of blocking alert
  showToast(isSaved ? `Added to Wishlist 💕` : `Removed from Wishlist`);

  // Update all heart buttons with matching data-wishlist-name
  document.querySelectorAll('[data-wishlist-name]').forEach(h => {
    if (h.getAttribute('data-wishlist-name') === name) {
      h.innerHTML = isSaved ? '♥' : '♡';
      h.style.background = isSaved ? '#f47aab' : '#fff0f5';
      h.style.color = isSaved ? '#fff' : '#d35d88';
      h.classList.toggle('active', isSaved);
    }
  });

  return isSaved;
};

window.saveCart = function (cart) {
  localStorage.setItem('tabby_cart_items', JSON.stringify(cart));
  window.updateCartBadge();
  if (document.getElementById('cartDrawerContent')) window.renderCartItems();
};

window.addGlobalCartItem = function (name, price, img) {
  let cart = window.getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price: parseInt(price), img, quantity: 1 });
  }
  localStorage.setItem('tabby_cart_items', JSON.stringify(cart));
  window.updateCartBadge();
  window.toggleCartDrawer(true); // This will inject if needed, then open
};

window.updateCartBadge = function () {
  const cart = window.getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  localStorage.setItem('tabby_cart_qty', totalQty);
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = totalQty;
    badge.style.transform = 'scale(1.2)';
    setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
  });
};

// KEY FIX: toggleCartDrawer ALWAYS injects first, then opens
window.toggleCartDrawer = function (open) {
  injectCartDrawer(); // Always ensure drawer exists
  const overlay = document.getElementById('cartDrawerOverlay');
  const drawer = document.getElementById('cartDrawer');
  if (!overlay || !drawer) return;

  if (open) {
    overlay.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
    window.renderCartItems();
  } else {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.changeQty = function (name, delta) {
  let cart = window.getCart();
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.name !== name);
    window.saveCart(cart);
  }
};

window.removeItem = function (name) {
  let cart = window.getCart().filter(i => i.name !== name);
  window.saveCart(cart);
};

window.renderCartItems = function () {
  const content = document.getElementById('cartDrawerContent');
  if (!content) return;

  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  const discountRow = document.getElementById('cartDiscountRow');
  const marketingEl = document.getElementById('cartMarketingText');

  const cart = window.getCart();

  if (cart.length === 0) {
    const isSubscribed = localStorage.getItem('tabby_subscribed') === 'true';
    const isFirstOrderCompleted = localStorage.getItem('tabby_first_order_completed') === 'true';
    let note = '';
    if (!isSubscribed) {
      note = `<div style="margin-top:18px;font-size:0.82rem;color:#d35d88;font-weight:700;background:rgba(244,122,171,0.05);padding:14px;border-radius:14px !important;border:1.5px dashed rgba(244,122,171,0.25);">🎁 Want 10% off? Subscribe on the Home page to save on your first order above ₹500!</div>`;
    } else if (isFirstOrderCompleted) {
      note = `<div style="margin-top:18px;font-size:0.82rem;color:#666;font-weight:700;background:rgba(0,0,0,0.02);padding:14px;border-radius:14px !important;border:1.5px dashed rgba(0,0,0,0.1);">Welcome discount was claimed on your first order. Thank you! ❤️</div>`;
    } else {
      note = `<div style="margin-top:18px;font-size:0.82rem;color:#2e7d32;font-weight:700;background:rgba(46,125,50,0.04);padding:14px;border-radius:14px !important;border:1.5px dashed rgba(46,125,50,0.2);">✨ 10% welcome discount active! Add charms above ₹500 to save.</div>`;
    }
    content.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-polaroid"><img src="add-to-cart.jpg" alt="Empty bag" /></div>
        <p class="empty-msg">Your shopping bag is empty!</p>
        <a href="shop" class="shop-now-btn" onclick="window.toggleCartDrawer(false)">Shop Our Charms</a>
        ${note}
      </div>`;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (shippingEl) shippingEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    if (discountRow) discountRow.style.display = 'none';
    if (marketingEl) marketingEl.style.display = 'none';
    // Reset coupon area
    const couponWrap = document.getElementById('cartCouponWrap');
    if (couponWrap) couponWrap.innerHTML = `
      <input type="text" id="cartCouponInput" placeholder="Coupon Code (e.g. REVIEW50)" style="flex:1;border:1.5px solid #e8e0f0;border-radius:8px;padding:8px 10px;font-size:0.8rem;outline:none;text-transform:uppercase;" />
      <button type="button" onclick="window.applyCartCoupon()" style="padding:8px 12px;border:1px solid #ddd;background:#fff;border-radius:8px;font-size:0.78rem;font-weight:700;cursor:pointer;">Apply</button>`;
    return;
  }

  let html = '';
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    html += `
      <div class="cart-item-card">
        <img src="${item.img || 'store-logo-c471e30d.webp'}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-price">₹${item.price}</div>
          <div class="cart-item-qty-row">
            <button class="qty-btn" onclick="window.changeQty('${item.name.replace(/'/g,"\\'")}', -1)">&minus;</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="window.changeQty('${item.name.replace(/'/g,"\\'")}', 1)">&plus;</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="window.removeItem('${item.name.replace(/'/g,"\\'")}')">×</button>
      </div>`;
  });
  content.innerHTML = html;

  // Welcome discount logic
  const isSubscribed = localStorage.getItem('tabby_subscribed') === 'true';
  const isFirstOrderCompleted = localStorage.getItem('tabby_first_order_completed') === 'true';
  let discount = 0;

  if (isSubscribed && !isFirstOrderCompleted && subtotal > 500) {
    discount = Math.round(subtotal * 0.1);
    if (discountRow) { discountRow.style.display = 'flex'; discountRow.innerHTML = `<span>10% Welcome Discount 🎁</span><span>-₹${discount}</span>`; }
    if (marketingEl) marketingEl.style.display = 'none';
  } else if (!isSubscribed && marketingEl) {
    marketingEl.style.display = 'block';
    marketingEl.innerHTML = subtotal > 500
      ? `🎁 Want 10% off? <a href="/" style="color:#d35d88;text-decoration:underline;font-weight:800;" onclick="window.toggleCartDrawer(false)">Subscribe on Home page</a> to save ₹${Math.round(subtotal*0.1)}!`
      : `🎁 Want 10% off? Add ₹${501-subtotal} more & <a href="/" style="color:#d35d88;text-decoration:underline;font-weight:800;" onclick="window.toggleCartDrawer(false)">subscribe</a> to save!`;
  } else if (discountRow) {
    discountRow.style.display = 'none';
  }

  // Applied coupon logic
  let appliedCoupon = null;
  try { appliedCoupon = JSON.parse(localStorage.getItem('tabby_applied_coupon') || 'null'); } catch(e) {}
  const usedCoupons = JSON.parse(localStorage.getItem('tabby_used_coupons') || '[]');
  if (appliedCoupon && usedCoupons.includes((appliedCoupon.code || '').toUpperCase())) {
    localStorage.removeItem('tabby_applied_coupon');
    appliedCoupon = null;
  }

  const couponWrap = document.getElementById('cartCouponWrap');
  if (couponWrap) {
    if (appliedCoupon) {
      const discText = appliedCoupon.type === 'percent' ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`;
      couponWrap.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;width:100%;background:#e8f5e9;padding:8px 12px;border-radius:8px !important;border:1px solid #a5d6a7;">
          <span style="font-weight:700;font-size:0.8rem;color:#2e7d32;">🏷️ ${appliedCoupon.code.toUpperCase()} (${discText})</span>
          <button type="button" onclick="window.removeCartCoupon()" style="background:none;border:none;color:#c62828;font-weight:800;font-size:1.1rem;cursor:pointer;">&times;</button>
        </div>`;

      let couponDiscount = 0;
      if (appliedCoupon.type === 'percent') couponDiscount = Math.round(subtotal * (appliedCoupon.value / 100));
      else if (appliedCoupon.type === 'flat') couponDiscount = appliedCoupon.value;

      if (couponDiscount > 0) {
        discount += couponDiscount;
        if (discountRow) { discountRow.style.display = 'flex'; discountRow.innerHTML = `<span>Coupon (${appliedCoupon.code})</span><span>-₹${couponDiscount}</span>`; }
      }
    } else {
      couponWrap.innerHTML = `
        <input type="text" id="cartCouponInput" placeholder="Coupon Code (e.g. REVIEW50)" style="flex:1;border:1.5px solid #e8e0f0;border-radius:8px;padding:8px 10px;font-size:0.8rem;outline:none;text-transform:uppercase;" />
        <button type="button" onclick="window.applyCartCoupon()" style="padding:8px 12px;border:1px solid #ddd;background:#fff;border-radius:8px;font-size:0.78rem;font-weight:700;cursor:pointer;">Apply</button>`;
    }
  }

  // Shipping
  const siteSettings = JSON.parse(localStorage.getItem('tabby_site_settings') || '{}');
  const stdFee = parseInt(siteSettings.standard_shipping_fee || '59');
  const freeThreshold = parseInt(siteSettings.free_shipping_threshold || '2000');
  const shipping = (subtotal >= freeThreshold || (appliedCoupon && appliedCoupon.type === 'free_shipping')) ? 0 : stdFee;

  const total = Math.max(0, subtotal - discount + shipping);
  if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE 🚚' : '₹' + shipping;
  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
};

window.removeCartCoupon = function () {
  localStorage.removeItem('tabby_applied_coupon');
  showToast('Coupon removed.');
  window.renderCartItems();
};

window.applyCartCoupon = async function () {
  const codeInput = document.getElementById('cartCouponInput');
  const code = (codeInput?.value || '').trim().toUpperCase();
  if (!code) return;

  const usedCoupons = JSON.parse(localStorage.getItem('tabby_used_coupons') || '[]');
  if (usedCoupons.includes(code)) {
    showToast(`❌ Coupon "${code}" was already used on a previous order.`);
    return;
  }

  let foundCoupon = null;

  if (window.supabaseClient) {
    try {
      const { data } = await window.supabaseClient.from('coupons').select('*').eq('code', code).eq('active', true);
      if (data && data.length > 0) foundCoupon = data[0];
    } catch (e) {}
  }

  if (!foundCoupon) {
    const localCoupons = JSON.parse(localStorage.getItem('tabby_coupons_local') || '[]');
    foundCoupon = localCoupons.find(c => c.code.toUpperCase() === code && c.active !== false) || null;
  }

  if (!foundCoupon) {
    if (code === 'WELCOME10') foundCoupon = { code: 'WELCOME10', type: 'percent', value: 10, min_order: 500 };
    else if (code === 'REVIEW50') foundCoupon = { code: 'REVIEW50', type: 'flat', value: 50, min_order: 0 };
  }

  if (foundCoupon) {
    localStorage.setItem('tabby_applied_coupon', JSON.stringify(foundCoupon));
    showToast(`🎉 Coupon "${foundCoupon.code}" applied!`);
    window.renderCartItems();
  } else {
    showToast(`❌ Invalid or inactive coupon code.`);
  }
};

window.triggerCheckout = function () {
  const cart = window.getCart();
  if (cart.length === 0) return;
  window.location.href = 'checkout';
};

// ==========================================================================
// TOAST NOTIFICATION (replaces all alert() calls)
// ==========================================================================

function showToast(message) {
  let toast = document.getElementById('tabbyChaserToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'tabbyChaserToast';
    toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);background:#333;color:#fff;padding:12px 24px;border-radius:50px;font-size:0.88rem;font-weight:700;z-index:999999;opacity:0;transition:all 0.3s ease;pointer-events:none;white-space:nowrap;max-width:90vw;text-align:center;';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2800);
}
window.showCuteToast = showToast;

// ==========================================================================
// SEARCH
// ==========================================================================

function initGlobalSearch() {
  document.querySelectorAll('.search-box-pill').forEach(pill => {
    if (pill.querySelector('.search-suggestions-dropdown')) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions-dropdown';
    pill.appendChild(dropdown);

    const input = pill.querySelector('input');
    if (!input) return;

    input.removeAttribute('disabled');
    input.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (!query) { dropdown.classList.remove('active'); dropdown.innerHTML = ''; return; }

      let localProds = [];
      try { localProds = JSON.parse(localStorage.getItem('tabby_products_local') || '[]'); } catch (ex) {}
      const defaultProds = typeof PRODUCTS_DATA !== 'undefined' ? PRODUCTS_DATA : [];

      const allMerged = [...localProds, ...defaultProds];
      const uniqueProds = Array.from(new Set(allMerged.map(p => p.id || p.name)))
        .map(key => allMerged.find(p => (p.id || p.name) === key));

      const deletedIds = JSON.parse(localStorage.getItem('tabby_deleted_product_ids') || '[]');
      const products = uniqueProds.filter(p => p.status !== 'draft' && !deletedIds.includes(p.id) && !deletedIds.includes(p.name));

      const matches = products.filter(p =>
        (p.name || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query)
      ).slice(0, 5);

      if (matches.length === 0) {
        dropdown.innerHTML = `<div style="padding:12px;text-align:center;color:#888;font-size:0.85rem;">No results found 🐈</div>`;
      } else {
        dropdown.innerHTML = matches.map(p => {
          const img = (p.images && p.images[0]) ? p.images[0] : (p.image || 'store-logo-c471e30d.webp');
          return `<a href="product?id=${p.id}" class="search-suggestion-item" style="display:flex;align-items:center;gap:10px;padding:10px 12px;text-decoration:none;color:#333;border-bottom:1px solid #f0f0f0;">
            <img src="${img}" alt="${p.name}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;">
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:0.85rem;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
              <div style="font-size:0.75rem;color:#d35d88;font-weight:700;">₹${p.price}</div>
            </div>
          </a>`;
        }).join('');
      }
      dropdown.classList.add('active');
    });

    document.addEventListener('click', (e) => { if (!pill.contains(e.target)) dropdown.classList.remove('active'); });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) window.location.href = `shop?search=${encodeURIComponent(input.value.trim())}`;
    });
  });
}

// ==========================================================================
// LOGIN MODAL – SELF-INJECTING (fixes timing issue permanently)
// ==========================================================================

function injectLoginModal() {
  if (document.getElementById('loginModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'loginModalOverlay';
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) window.toggleLoginModal(false); };
  overlay.innerHTML = `
    <div class="login-modal-card">
      <button type="button" class="modal-close-btn" onclick="window.toggleLoginModal(false)">&times;</button>

      <div id="loginFormContainer">
        <h2 class="login-modal-title">Welcome Back 🐾</h2>
        <p class="login-modal-subtitle">Sign in to your Tabby Chaser account</p>
        <form id="loginForm" onsubmit="window.handleLoginSubmit(event)" class="login-modal-form">
          <div class="form-group">
            <label class="form-label" for="loginEmail">Email</label>
            <input type="email" id="loginEmail" required class="form-input" placeholder="hello@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label" for="loginPassword">Password</label>
            <div class="password-input-wrapper">
              <input type="password" id="loginPassword" required class="form-input" placeholder="••••••••" />
              <button type="button" class="password-toggle-eye" onclick="window.togglePasswordVisibility('loginPassword')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-pink-pill login-submit-btn">Sign In</button>
        </form>
        <div class="login-footer-text">Don't have an account? <a href="#" onclick="event.preventDefault(); window.toggleAuthMode('signup')">Sign Up</a></div>
      </div>

      <div id="signupFormContainer" style="display:none;">
        <h2 class="login-modal-title">Create Account ✨</h2>
        <p class="login-modal-subtitle">Join Tabby Chaser today</p>
        <form id="signUpForm" onsubmit="window.handleSignUpSubmit(event)" class="login-modal-form">
          <div class="form-group">
            <label class="form-label" for="signUpName">Full Name</label>
            <input type="text" id="signUpName" required class="form-input" placeholder="Your name" />
          </div>
          <div class="form-group">
            <label class="form-label" for="signUpEmail">Email</label>
            <input type="email" id="signUpEmail" required class="form-input" placeholder="hello@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label" for="signUpPassword">Password</label>
            <div class="password-input-wrapper">
              <input type="password" id="signUpPassword" required class="form-input" placeholder="Min. 6 characters" minlength="6" />
              <button type="button" class="password-toggle-eye" onclick="window.togglePasswordVisibility('signUpPassword')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-pink-pill login-submit-btn">Create Account</button>
        </form>
        <div class="login-footer-text">Already have an account? <a href="#" onclick="event.preventDefault(); window.toggleAuthMode('login')">Sign In</a></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

// KEY FIX: toggleLoginModal ALWAYS injects first, then opens
window.toggleLoginModal = function (open) {
  injectLoginModal(); // Always ensure modal exists
  const overlay = document.getElementById('loginModalOverlay');
  if (!overlay) return;
  overlay.style.display = open ? 'flex' : 'none';
  if (open) overlay.style.zIndex = '999999';
};

window.toggleAuthMode = function (mode) {
  const loginF = document.getElementById('loginFormContainer');
  const signupF = document.getElementById('signupFormContainer');
  if (!loginF || !signupF) return;
  loginF.style.display = mode === 'login' ? 'block' : 'none';
  signupF.style.display = mode === 'signup' ? 'block' : 'none';
};

window.togglePasswordVisibility = function (inputId) {
  const input = document.getElementById(inputId);
  if (input) input.type = input.type === 'password' ? 'text' : 'password';
};

window.handleLoginSubmit = async function (event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword')?.value || '';

  const submitBtn = event.target.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Signing in...'; }

  let name = email.split('@')[0];
  let loggedIn = false;

  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        loggedIn = true;
        // Try to get name from profile
        const { data: profile } = await window.supabaseClient.from('profiles').select('name').eq('id', data.user.id).single();
        if (profile?.name) name = profile.name;
      } else if (error) {
        showToast('❌ ' + (error.message || 'Login failed. Check your credentials.'));
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
        return;
      }
    } catch (err) {
      showToast('❌ Login failed. Please try again.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Sign In'; }
      return;
    }
  }

  localStorage.setItem('tabby_user_session', JSON.stringify({ name, email, loggedIn: true }));
  window.toggleLoginModal(false);
  initHeaderAccountButton();
  showToast(`Welcome back, ${name.split(' ')[0]}! 🐾`);
  setTimeout(() => window.location.href = 'account', 800);
};

window.handleSignUpSubmit = async function (event) {
  event.preventDefault();
  const name = document.getElementById('signUpName').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword')?.value || '';

  const submitBtn = event.target.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; }

  let loggedIn = false;

  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient.auth.signUp({ email, password, options: { data: { name } } });
      if (!error && data.user) {
        loggedIn = true;
        await window.supabaseClient.from('profiles').upsert({ id: data.user.id, name, email });
      } else if (error) {
        showToast('❌ ' + (error.message || 'Sign up failed.'));
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
        return;
      }
    } catch (err) {
      showToast('❌ Sign up failed. Please try again.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account'; }
      return;
    }
  }

  localStorage.setItem('tabby_user_session', JSON.stringify({ name, email, loggedIn: true }));
  window.toggleLoginModal(false);
  initHeaderAccountButton();
  showToast(`Welcome to Tabby Chaser, ${name.split(' ')[0]}! 🎉`);
  setTimeout(() => window.location.href = 'account', 800);
};

// ==========================================================================
// HEADER ACCOUNT BUTTON
// ==========================================================================

function initHeaderAccountButton() {
  const session = JSON.parse(localStorage.getItem('tabby_user_session') || 'null');

  // Bind ALL profile SVG icons in header
  document.querySelectorAll('.profile-header-btn').forEach(btn => {
    if (session && session.loggedIn) {
      btn.href = 'account';
      btn.onclick = null;
    } else {
      btn.href = '#';
      btn.onclick = (e) => { e.preventDefault(); window.toggleLoginModal(true); };
    }
  });
}

function initShopCardLinks() {
  if (typeof PRODUCTS_DATA === 'undefined') return;
  document.querySelectorAll('.shop-card').forEach(card => {
    const name = card.getAttribute('data-name');
    if (!name) return;
    const product = PRODUCTS_DATA.find(p => p.name === name);
    if (product) {
      const link = card.querySelector('.shop-card-link');
      if (link) link.href = `product?id=${product.id}`;
    }
  });
}

// ==========================================================================
// NEWSLETTER / WELCOME GIFT – ONE TIME PER EMAIL
// ==========================================================================

window.handleNewsletterSubscribe = function (event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  if (!input) return;
  const email = input.value.trim().toLowerCase();
  if (!email) return;

  // Check if this email already subscribed
  const subscribedEmails = JSON.parse(localStorage.getItem('tabby_subscribed_emails') || '[]');
  if (subscribedEmails.includes(email)) {
    showToast('You have already claimed your welcome gift! 🎁');
    input.value = '';
    return;
  }

  // Mark as subscribed (one-time per email)
  subscribedEmails.push(email);
  localStorage.setItem('tabby_subscribed_emails', JSON.stringify(subscribedEmails));
  localStorage.setItem('tabby_subscribed', 'true');
  localStorage.setItem('tabby_subscribed_email', email);

  // Auto-apply 10% Welcome Coupon (one-time)
  const welcomeCoupon = { code: 'WELCOME10', type: 'percent', value: 10, min_order: 500 };
  localStorage.setItem('tabby_applied_coupon', JSON.stringify(welcomeCoupon));

  input.value = '';

  // Show cute popup modal
  window.showCuteDiscountModal();
};

// ==========================================================================
// WELCOME GIFT MODAL – SELF-INJECTING
// ==========================================================================

function injectCuteDiscountModal() {
  if (document.getElementById('cuteDiscountModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cuteDiscountModalOverlay';
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) window.closeCuteDiscountModal(); };
  overlay.innerHTML = `
    <div class="cute-discount-card">
      <button type="button" class="modal-close-btn" onclick="window.closeCuteDiscountModal()">&times;</button>
      <div style="font-size:3rem;margin-bottom:16px;">🎁</div>
      <h2 class="login-modal-title" style="font-size:1.65rem;margin-bottom:10px;">Welcome Gift Unlocked!</h2>
      <p class="cute-modal-desc">Thank you for joining! You've received a special one-time welcome discount:</p>
      <div class="cute-coupon-badge">
        <span class="coupon-code-text">10% OFF</span>
        <span class="coupon-sub-text">on orders above ₹500 • One-time use</span>
      </div>
      <p class="cute-modal-note">This discount is automatically applied to your cart for your first order. Valid once per email. Happy shopping! 🌸</p>
      <button type="button" class="btn btn-pink-pill cute-modal-btn" onclick="window.closeCuteDiscountModal(); window.toggleCartDrawer(true)">YAY! Let's Shop 🛍️</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

window.closeCuteDiscountModal = function () {
  const overlay = document.getElementById('cuteDiscountModalOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.showCuteDiscountModal = function () {
  injectCuteDiscountModal(); // Always ensure modal exists
  const overlay = document.getElementById('cuteDiscountModalOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.zIndex = '999999';
  }
};

// ==========================================================================
// MARK COUPON USED AFTER ORDER (called from checkout)
// ==========================================================================

window.markCouponUsedAfterOrder = function () {
  const appliedCoupon = JSON.parse(localStorage.getItem('tabby_applied_coupon') || 'null');
  if (appliedCoupon?.code) {
    const usedCoupons = JSON.parse(localStorage.getItem('tabby_used_coupons') || '[]');
    const code = appliedCoupon.code.toUpperCase();
    if (!usedCoupons.includes(code)) {
      usedCoupons.push(code);
      localStorage.setItem('tabby_used_coupons', JSON.stringify(usedCoupons));
    }
    localStorage.removeItem('tabby_applied_coupon');
  }
  localStorage.setItem('tabby_first_order_completed', 'true');
};

// ==========================================================================
// DOMContentLoaded – Initialize everything
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('Tabby Chaser Engine v3 initialized.');

  // Inject all modals upfront (prevents timing issues with inline onclick)
  injectCartDrawer();
  injectLoginModal();

  // Initialize UI
  window.updateCartBadge();
  initHeaderAccountButton();
  initGlobalSearch();
  initShopCardLinks();
  startAutoPlay();
});
