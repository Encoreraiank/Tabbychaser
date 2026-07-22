// ==========================================================================
// Tabby Chaser E-Commerce Engine
// smooth crossfade slideshow, global cart drawer, search suggestion, and login auth
// ==========================================================================

// Load Supabase dynamically at the very top of app.js
(function() {
  if (document.getElementById('supabase-sdk-script')) return;
  const cdn = document.createElement('script');
  cdn.id = 'supabase-sdk-script';
  cdn.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  cdn.async = false;
  cdn.onload = () => {
    const config = document.createElement('script');
    config.src = 'supabase-config.js';
    config.async = false;
    document.head.appendChild(config);
  };
  document.head.appendChild(cdn);
})();

let currentSlideIdx = 0;
let slideInterval;
const totalSlides = 4;

document.addEventListener('DOMContentLoaded', () => {
  console.log("Tabby Chaser E-Commerce Engine initialized.");
  
  // Inject Cart Drawer HTML
  injectCartDrawer();

  // Set simple cart quantity
  window.updateCartBadge();

  // Inject Login Modal HTML
  injectLoginModal();

  // Initialize Login Button in Header
  initHeaderAccountButton();

  // Initialize Search suggestions dropdown
  initGlobalSearch();

  // Convert shop card placeholders to dynamic links on the fly
  initShopCardLinks();

  // Start Autoplay
  startAutoPlay();
});

// Update active slide state
function updateSlideshow(index) {
  const slidesWrapper = document.getElementById('slidesWrapper');
  const dotsContainer = document.getElementById('sliderDots');
  if (!slidesWrapper || !dotsContainer) return;

  const slides = slidesWrapper.querySelectorAll('.hero-slide');
  const dots = dotsContainer.querySelectorAll('.dot');

  // Toggle active class on slides
  slides.forEach((slide, idx) => {
    if (idx === index) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  // Toggle active class on indicators
  dots.forEach((dot, idx) => {
    if (idx === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Global slide navigation hook
window.goToSlide = function(index) {
  currentSlideIdx = index;
  updateSlideshow(currentSlideIdx);
  resetAutoPlay();
};

// Autoplay slide rotation
function startAutoPlay() {
  slideInterval = setInterval(() => {
    currentSlideIdx = (currentSlideIdx + 1) % totalSlides;
    updateSlideshow(currentSlideIdx);
  }, 5000); // Shift every 5 seconds
}

function resetAutoPlay() {
  clearInterval(slideInterval);
  startAutoPlay();
}

// ==========================================================================
// GLOBAL CART DRAWER LOGIC
// ==========================================================================

function injectCartDrawer() {
  if (document.getElementById('cartDrawer')) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'cartDrawerOverlay';
  overlay.className = 'cart-drawer-overlay';
  overlay.onclick = () => window.toggleCartDrawer(false);
  document.body.appendChild(overlay);

  // Create drawer
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
      <div class="cart-summary-row">
        <span>Subtotal</span>
        <span id="cartSubtotal">₹0</span>
      </div>
      <div class="cart-summary-row" id="cartDiscountRow" style="display:none; color: #2e7d32; font-weight: 600;">
        <span>10% Welcome Discount</span>
        <span id="cartDiscount">-₹0</span>
      </div>
      <div class="cart-summary-row">
        <span>Shipping</span>
        <span id="cartShipping">₹59</span>
      </div>
      <div class="cart-summary-row total-row">
        <span>Total Estimate</span>
        <span id="cartTotal">₹0</span>
      </div>
      <div class="cart-marketing-text" id="cartMarketingText" style="display:none; font-size: 0.8rem; color: #d35d88; text-align: center; margin-bottom: 12px; font-weight: 600; line-height: 1.4; padding: 10px; background-color: rgba(244, 122, 171, 0.08); border-radius: 10px !important;">
        🎁 Subscribe to our welcome gift to get 10% off on orders above ₹500!
      </div>
      <div style="display:flex; gap:6px; margin-bottom:12px;">
        <input type="text" id="cartCouponInput" placeholder="Coupon Code (e.g. PAWS15)" style="flex:1; border:1.5px solid #e8e0f0; border-radius:8px; padding:8px 10px; font-size:0.8rem; outline:none; text-transform:uppercase;" />
        <button type="button" onclick="window.applyCartCoupon()" style="padding:8px 12px; border:1px solid #ddd; background:#fff; border-radius:8px; font-size:0.78rem; font-weight:700; cursor:pointer;">Apply</button>
      </div>
      <button class="checkout-btn" onclick="window.triggerCheckout()">Proceed to Checkout ✨</button>
    </div>
  `;
  document.body.appendChild(drawer);

  // Bind click listeners globally for cart buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cart-pill-btn') || e.target.closest('#cartBtn')) {
      e.preventDefault();
      window.toggleCartDrawer(true);
    }
  });
}

window.getCart = function() {
  try {
    return JSON.parse(localStorage.getItem('tabby_cart_items')) || [];
  } catch (e) {
    return [];
  }
};

window.getWishlist = function() {
  try {
    return JSON.parse(localStorage.getItem('tabby_wishlist_items')) || [];
  } catch(e) { return []; }
};

window.toggleWishlist = function(idOrName, name, price, img, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  let list = window.getWishlist();
  const index = list.findIndex(item => item.name === name);
  let isSaved = false;

  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push({ id: idOrName, name, price: parseInt(price), img });
    isSaved = true;
  }

  localStorage.setItem('tabby_wishlist_items', JSON.stringify(list));
  
  alert(isSaved ? `Added "${name}" to your Wishlist 💕` : `Removed "${name}" from your Wishlist`);
  
  // Update heart buttons across DOM
  const hearts = document.querySelectorAll(`[data-wishlist-name="${CSS.escape(name)}"]`);
  hearts.forEach(h => {
    if (isSaved) {
      h.classList.add('active');
      h.innerHTML = '♥';
    } else {
      h.classList.remove('active');
      h.innerHTML = '♡';
    }
  });
};

window.saveCart = function(cart) {
  localStorage.setItem('tabby_cart_items', JSON.stringify(cart));
  window.updateCartBadge();
  window.renderCartItems();
};

window.addGlobalCartItem = function(name, price, img) {
  let cart = window.getCart();
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price: parseInt(price), img, quantity: 1 });
  }
  window.saveCart(cart);
  window.toggleCartDrawer(true);
};

window.updateCartBadge = function() {
  const cart = window.getCart();
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  localStorage.setItem('tabby_cart_qty', totalQty);
  
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = totalQty;
    badge.style.transform = 'scale(1.2)';
    setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
  });
};

window.toggleCartDrawer = function(open) {
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

window.changeQty = function(name, delta) {
  let cart = window.getCart();
  const item = cart.find(i => i.name === name);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.name !== name);
    }
    window.saveCart(cart);
  }
};

window.removeItem = function(name) {
  let cart = window.getCart();
  cart = cart.filter(i => i.name !== name);
  window.saveCart(cart);
};

window.renderCartItems = function() {
  const content = document.getElementById('cartDrawerContent');
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  const discountRow = document.getElementById('cartDiscountRow');
  const marketingEl = document.getElementById('cartMarketingText');
  if (!content) return;

  const cart = window.getCart();
  if (cart.length === 0) {
    const isSubscribed = localStorage.getItem('tabby_subscribed') === 'true';
    const isFirstOrderCompleted = localStorage.getItem('tabby_first_order_completed') === 'true';
    let marketingNote = '';
    
    if (!isSubscribed) {
      marketingNote = `
        <div style="margin-top: 18px; font-size: 0.82rem; color: #d35d88; font-weight: 700; background-color: rgba(244, 122, 171, 0.05); padding: 14px; border-radius: 14px !important; border: 1.5px dashed rgba(244, 122, 171, 0.25); line-height: 1.45;">
          🎁 Want 10% off? Subscribe to our welcome gift on the Home page to save on your first order above ₹500!
        </div>
      `;
    } else if (isFirstOrderCompleted) {
      marketingNote = `
        <div style="margin-top: 18px; font-size: 0.82rem; color: #666; font-weight: 700; background-color: rgba(0, 0, 0, 0.02); padding: 14px; border-radius: 14px !important; border: 1.5px dashed rgba(0, 0, 0, 0.1); line-height: 1.45;">
          Welcome discount was claimed on your first order. Thank you for supporting us! ❤️
        </div>
      `;
    } else {
      marketingNote = `
        <div style="margin-top: 18px; font-size: 0.82rem; color: #2e7d32; font-weight: 700; background-color: rgba(46, 125, 50, 0.04); padding: 14px; border-radius: 14px !important; border: 1.5px dashed rgba(46, 125, 50, 0.2); line-height: 1.45;">
          ✨ 10% welcome discount active! Add charms above ₹500 to save.
        </div>
      `;
    }

    content.innerHTML = `
      <div class="cart-empty-state">
        <div class="cart-empty-polaroid">
          <img src="add-to-cart.jpg" alt="Empty Shopping Bag" />
        </div>
        <p class="empty-msg">Your shopping bag is empty!</p>
        <a href="shop.html" class="shop-now-btn" onclick="window.toggleCartDrawer(false)">Shop Our Charms</a>
        ${marketingNote}
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (shippingEl) shippingEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    if (discountRow) discountRow.style.display = 'none';
    if (marketingEl) marketingEl.style.display = 'none';
    return;
  }

  let html = '';
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    const displayImg = item.img || 'store-logo-c471e30d.webp';
    html += `
      <div class="cart-item-card">
        <img src="${displayImg}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h4 class="cart-item-name">${item.name}</h4>
          <div class="cart-item-price">₹${item.price}</div>
          <div class="cart-item-qty-row">
            <button class="qty-btn" onclick="window.changeQty('${item.name}', -1)">&minus;</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="window.changeQty('${item.name}', 1)">&plus;</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="window.removeItem('${item.name}')" title="Remove item">&times;</button>
      </div>
    `;
  });

  content.innerHTML = html;
  
  const isSubscribed = localStorage.getItem('tabby_subscribed') === 'true';
  const isFirstOrderCompleted = localStorage.getItem('tabby_first_order_completed') === 'true';
  let discount = 0;
  
  if (isSubscribed) {
    if (isFirstOrderCompleted) {
      if (discountRow) {
        discountRow.style.display = 'flex';
        discountRow.innerHTML = `<span style="color: #666; font-size: 0.8rem; font-weight: 700;">First order discount claimed! ❤️</span><span></span>`;
      }
      if (marketingEl) marketingEl.style.display = 'none';
    } else {
      if (subtotal > 500) {
        discount = Math.round(subtotal * 0.1);
        if (discountRow) {
          discountRow.style.display = 'flex';
          discountRow.innerHTML = `<span>10% Welcome Discount (Subscribed)</span><span>-₹${discount}</span>`;
        }
        if (marketingEl) marketingEl.style.display = 'none';
      } else {
        if (discountRow) {
          discountRow.style.display = 'flex';
          discountRow.innerHTML = `<span style="color: #ef6c00; font-size: 0.82rem; font-weight: 700;">Add ₹${501 - subtotal} more to unlock 10% welcome discount! 🎁</span><span></span>`;
        }
        if (marketingEl) marketingEl.style.display = 'none';
      }
    }
  } else {
    if (discountRow) discountRow.style.display = 'none';
    if (marketingEl) {
      marketingEl.style.display = 'block';
      if (subtotal > 500) {
        marketingEl.innerHTML = `🎁 Want 10% off? <a href="index.html#policies" style="color: #d35d88; text-decoration: underline; font-weight: 800;" onclick="window.toggleCartDrawer(false)">Subscribe to our welcome gift</a> to save ₹${Math.round(subtotal * 0.1)} on this order!`;
      } else {
        marketingEl.innerHTML = `🎁 Want 10% off? Add ₹${501 - subtotal} more and <a href="index.html#policies" style="color: #d35d88; text-decoration: underline; font-weight: 800;" onclick="window.toggleCartDrawer(false)">subscribe to our welcome gift</a> to save!`;
      }
    }
  }

  // Check applied coupon & validate against active/used lists
  let appliedCoupon = JSON.parse(localStorage.getItem('tabby_applied_coupon') || 'null');
  const usedCoupons = JSON.parse(localStorage.getItem('tabby_used_coupons') || '[]');

  if (appliedCoupon) {
    const code = (appliedCoupon.code || '').toUpperCase();
    
    // Check if already used by user
    if (usedCoupons.includes(code)) {
      localStorage.removeItem('tabby_applied_coupon');
      appliedCoupon = null;
    } else {
      // Validate against active coupons list
      const localCoupons = JSON.parse(localStorage.getItem('tabby_coupons_local') || '[]');
      const isKnownStatic = (code === 'WELCOME10' || code.startsWith('PAWS15'));
      const isLocallyActive = localCoupons.some(c => c.code.toUpperCase() === code && c.active !== false);

      if (!isKnownStatic && !isLocallyActive) {
        // Clear inactive/deleted coupon
        localStorage.removeItem('tabby_applied_coupon');
        appliedCoupon = null;
      }
    }
  }

  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'flat') {
      discount = appliedCoupon.value;
    }
    if (discountRow) {
      discountRow.style.display = 'flex';
      discountRow.innerHTML = `<span>Coupon (${appliedCoupon.code})</span><span>-₹${discount}</span>`;
    }
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  // Dynamic shipping calculation
  const siteSettings = JSON.parse(localStorage.getItem('tabby_site_settings') || '{}');
  const stdShippingFee = parseInt(siteSettings.standard_shipping_fee || '59');
  const freeThreshold = parseInt(siteSettings.free_shipping_threshold || '2000');

  let shipping = stdShippingFee;
  if (subtotal >= freeThreshold || (appliedCoupon && appliedCoupon.type === 'free_shipping')) {
    shipping = 0;
  }

  const total = Math.max(0, subtotal - discount + shipping);

  if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'FREE 🚚' : '₹' + shipping;
  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
}

// ---- APPLY CART COUPON ----
window.applyCartCoupon = async function() {
  const codeInput = document.getElementById('cartCouponInput');
  const code = (codeInput?.value || '').trim().toUpperCase();
  if (!code) return;

  // Check one-time use restriction
  const usedCoupons = JSON.parse(localStorage.getItem('tabby_used_coupons') || '[]');
  if (usedCoupons.includes(code)) {
    alert(`❌ You have already used coupon "${code}" on a previous order. Each coupon code can only be used once!`);
    return;
  }

  let foundCoupon = null;

  // 1. Try Supabase
  if (window.supabaseClient) {
    try {
      const { data } = await window.supabaseClient.from('coupons').select('*').eq('code', code).eq('active', true);
      if (data && data.length > 0) foundCoupon = data[0];
    } catch(e) {}
  }

  // 2. Check LocalStorage fallback
  if (!foundCoupon) {
    const localCoupons = JSON.parse(localStorage.getItem('tabby_coupons_local') || '[]');
    foundCoupon = localCoupons.find(c => c.code.toUpperCase() === code && c.active !== false);
  }

  // Special welcome / review coupon check
  if (!foundCoupon && (code === 'WELCOME10' || code.startsWith('PAWS15'))) {
    foundCoupon = { code: code, type: 'percent', value: code.startsWith('PAWS15') ? 15 : 10 };
  }

  if (foundCoupon) {
    localStorage.setItem('tabby_applied_coupon', JSON.stringify(foundCoupon));
    alert(`🎉 Coupon "${foundCoupon.code}" applied successfully!`);
    window.renderCartItems();
  } else {
    alert(`❌ Coupon code "${code}" is invalid or inactive in store.`);
  }
};;

window.triggerCheckout = function() {
  const cart = window.getCart();
  if (cart.length === 0) return;

  // Redirect to checkout.html for shipping info collection and payment
  window.location.href = 'checkout.html';
};

// ==========================================================================
// SEARCH SECTION LOGIC
// ==========================================================================

function initGlobalSearch() {
  const searchPills = document.querySelectorAll('.search-box-pill');
  searchPills.forEach(pill => {
    if (pill.querySelector('.search-suggestions-dropdown')) return;
    
    // Create Dropdown Overlay
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions-dropdown';
    dropdown.id = 'searchSuggestions';
    pill.appendChild(dropdown);

    const input = pill.querySelector('input');
    if (input) {
      input.removeAttribute('disabled'); // Allow searching
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
          dropdown.classList.remove('active');
          dropdown.innerHTML = '';
          return;
        }

        // Search PRODUCTS_DATA if loaded
        if (typeof PRODUCTS_DATA !== 'undefined') {
          const matches = PRODUCTS_DATA.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
          ).slice(0, 5);

          if (matches.length === 0) {
            dropdown.innerHTML = `<div class="search-no-results">No results found 🐈</div>`;
          } else {
            dropdown.innerHTML = matches.map(p => `
              <a href="product.html?id=${p.id}" class="search-suggestion-item">
                <img src="${p.image}" alt="${p.name}" class="suggestion-img">
                <div class="suggestion-info">
                  <span class="suggestion-name">${p.name}</span>
                  <span class="suggestion-price">₹${p.price}</span>
                </div>
              </a>
            `).join('');
          }
          dropdown.classList.add('active');
        }
      });

      // Close overlay on clicking outside
      document.addEventListener('click', (event) => {
        if (!pill.contains(event.target)) {
          dropdown.classList.remove('active');
        }
      });

      // Handle Enter key submit search
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = input.value.trim();
          if (query) {
            window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  });
}

// ==========================================================================
// USER LOGIN MODAL LOGIC
// ==========================================================================

function injectLoginModal() {
  if (document.getElementById('loginModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'loginModalOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="login-modal-card">
      <button type="button" class="modal-close-btn" onclick="window.toggleLoginModal(false)" aria-label="Close modal">&times;</button>
      
      <!-- Login Container -->
      <div id="loginFormContainer">
        <h2 class="login-modal-title">Welcome Back</h2>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
              <a href="#" class="forgot-password-link" onclick="event.preventDefault(); alert('Reset password link sent to your email!')">Forgot Password?</a>
            </div>
          </div>

          <!-- Cloudflare Mock Verification -->
          <div class="mock-cf-turnstile">
            <div class="cf-check-wrap">
              <span class="cf-check-circle">✓</span>
              <span class="cf-success-text">Success!</span>
            </div>
            <div class="cf-logo-wrap">
              <span class="cf-logo-text">CLOUDFLARE</span>
              <a href="#" class="cf-privacy-link" onclick="event.preventDefault()">Privacy</a> • <a href="#" class="cf-privacy-link" onclick="event.preventDefault()">Help</a>
            </div>
          </div>
          
          <button type="submit" class="btn btn-pink-pill login-submit-btn">Sign In</button>
        </form>
        
        <div class="login-footer-text">
          Don't have an account? <a href="#" onclick="event.preventDefault(); window.toggleAuthMode('signup')">Sign Up</a>
        </div>
      </div>

      <!-- Sign Up Container -->
      <div id="signupFormContainer" style="display:none;">
        <h2 class="login-modal-title">Create Account</h2>
        <p class="login-modal-subtitle">Sign up for a Tabby Chaser account</p>
        
        <form id="signUpForm" onsubmit="window.handleSignUpSubmit(event)" class="login-modal-form">
          <div class="form-group">
            <label class="form-label" for="signUpName">Full Name</label>
            <input type="text" id="signUpName" required class="form-input" placeholder="ENCORE" />
          </div>
          <div class="form-group">
            <label class="form-label" for="signUpEmail">Email</label>
            <input type="email" id="signUpEmail" required class="form-input" placeholder="hello@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label" for="signUpPassword">Password</label>
            <div class="password-input-wrapper">
              <input type="password" id="signUpPassword" required class="form-input" placeholder="••••••••" />
              <button type="button" class="password-toggle-eye" onclick="window.togglePasswordVisibility('signUpPassword')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>
          
          <button type="submit" class="btn btn-pink-pill login-submit-btn">Sign Up</button>
        </form>
        
        <div class="login-footer-text">
          Already have an account? <a href="#" onclick="event.preventDefault(); window.toggleAuthMode('login')">Sign In</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

window.toggleLoginModal = function(open) {
  const overlay = document.getElementById('loginModalOverlay');
  if (!overlay) return;
  if (open) {
    overlay.style.display = 'flex';
  } else {
    overlay.style.display = 'none';
  }
};

window.toggleAuthMode = function(mode) {
  const loginForm = document.getElementById('loginFormContainer');
  const signupForm = document.getElementById('signupFormContainer');
  if (mode === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  }
};

window.togglePasswordVisibility = function(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  }
};

window.handleLoginSubmit = async function(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword')?.value || 'dummyPassword123';

  let name = email.split('@')[0];
  let loggedIn = false;

  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) throw error;

      if (data.user) {
        loggedIn = true;
        // Try fetching user name from profile
        const { data: profile } = await window.supabaseClient
          .from('profiles')
          .select('name')
          .eq('id', data.user.id)
          .single();
        if (profile && profile.name) {
          name = profile.name;
        }
      }
    } catch (err) {
      console.warn('Supabase Login failed, using offline fallback:', err.message);
    }
  }

  localStorage.setItem('tabby_user_session', JSON.stringify({ name: name, email: email, loggedIn: true, offline: !loggedIn }));
  window.toggleLoginModal(false);
  initHeaderAccountButton();
  window.location.href = 'account.html';
};

window.handleSignUpSubmit = async function(event) {
  event.preventDefault();
  const name = document.getElementById('signUpName').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  const password = document.getElementById('signUpPassword')?.value || 'dummyPassword123';

  let loggedIn = false;

  if (window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { name: name }
        }
      });
      if (error) throw error;

      if (data.user) {
        loggedIn = true;
        // Insert into public profiles table
        const { error: profileError } = await window.supabaseClient
          .from('profiles')
          .upsert({ id: data.user.id, name: name, email: email });
        if (profileError) console.error('Error inserting profile:', profileError);
      }
    } catch (err) {
      console.warn('Supabase SignUp failed, using offline fallback:', err.message);
    }
  }

  localStorage.setItem('tabby_user_session', JSON.stringify({ name: name, email: email, loggedIn: true, offline: !loggedIn }));
  window.toggleLoginModal(false);
  initHeaderAccountButton();
  window.location.href = 'account.html';
};

function initHeaderAccountButton() {
  const headerActions = document.querySelector('.header-actions');
  if (!headerActions) return;

  let loginBtn = document.getElementById('loginBtn');
  if (!loginBtn) {
    loginBtn = document.createElement('a');
    loginBtn.id = 'loginBtn';
    loginBtn.className = 'login-pill-btn';
    loginBtn.href = '#';
    headerActions.insertBefore(loginBtn, headerActions.querySelector('.cart-pill-btn') || headerActions.firstChild);
  }

  const session = JSON.parse(localStorage.getItem('tabby_user_session'));
  if (session && session.loggedIn) {
    loginBtn.textContent = `Hi, ${session.name.split(' ')[0]}`;
    loginBtn.href = 'account.html';
    loginBtn.onclick = null;
  } else {
    loginBtn.textContent = 'Login';
    loginBtn.href = '#';
    loginBtn.onclick = (e) => {
      e.preventDefault();
      window.toggleLoginModal(true);
    };
  }
}

function initShopCardLinks() {
  document.querySelectorAll('.shop-card').forEach(card => {
    const name = card.getAttribute('data-name');
    if (name && typeof PRODUCTS_DATA !== 'undefined') {
      const product = PRODUCTS_DATA.find(p => p.name === name);
      if (product) {
        const link = card.querySelector('.shop-card-link');
        if (link) link.href = `product.html?id=${product.id}`;
      }
    }
  });
}

window.handleNewsletterSubscribe = function(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input[type="email"]');
  if (!input) return;
  const email = input.value.trim();
  if (!email) return;

  localStorage.setItem('tabby_subscribed', 'true');
  localStorage.setItem('tabby_subscribed_email', email);
  input.value = '';

  // Show cute modal discount unlocked message
  window.showCuteDiscountModal();

  if (window.renderCartItems) {
    window.renderCartItems();
  }
};

function injectCuteDiscountModal() {
  if (document.getElementById('cuteDiscountModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cuteDiscountModalOverlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="cute-discount-card">
      <button type="button" class="modal-close-btn" onclick="window.closeCuteDiscountModal()">&times;</button>
      <div class="cute-gift-polaroid">
        <img src="ten-percent-gift.png" alt="Welcome Gift" />
      </div>
      <h2 class="login-modal-title" style="font-size: 1.65rem; margin-bottom: 10px;">Welcome Gift Unlocked!</h2>
      <p class="cute-modal-desc">Thank you for joining our newsletter! You've received a special first-time welcome discount:</p>
      <div class="cute-coupon-badge">
        <span class="coupon-code-text">10% OFF</span>
        <span class="coupon-sub-text">on orders above ₹500</span>
      </div>
      <p class="cute-modal-note">This discount will be automatically applied to your cart on your first order. Happy shopping! 🌸</p>
      <button type="button" class="btn btn-pink-pill cute-modal-btn" onclick="window.closeCuteDiscountModal()">YAY! Let's Shop 🛍️</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

window.closeCuteDiscountModal = function() {
  const overlay = document.getElementById('cuteDiscountModalOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
};

window.showCuteDiscountModal = function() {
  injectCuteDiscountModal();
  const overlay = document.getElementById('cuteDiscountModalOverlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
};


