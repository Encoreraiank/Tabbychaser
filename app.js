// ==========================================================================
// Tabby Chaser E-Commerce Engine
// smooth crossfade slideshow, global cart drawer, search suggestion, and login auth
// ==========================================================================

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
    content.innerHTML = `
      <div class="cart-empty-state">
        <span class="empty-emoji">🐈</span>
        <p class="empty-msg">Your shopping bag is empty!</p>
        <a href="shop.html" class="shop-now-btn" onclick="window.toggleCartDrawer(false)">Shop Our Charms</a>
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
  let discount = 0;
  
  if (isSubscribed) {
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
  } else {
    if (discountRow) discountRow.style.display = 'none';
    if (marketingEl) {
      marketingEl.style.display = 'block';
      marketingEl.innerHTML = `🎁 Subscribe to our welcome gift on the Home page to get 10% off on orders above ₹500!`;
    }
  }

  const shipping = 59;
  const total = subtotal - discount + shipping;

  if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');
  if (shippingEl) shippingEl.textContent = '₹' + shipping;
  if (totalEl) totalEl.textContent = '₹' + total.toLocaleString('en-IN');
};

window.triggerCheckout = function() {
  const cart = window.getCart();
  if (cart.length === 0) return;

  alert(`🛒 Checkout Successful!\n\nYour order has been submitted. Thank you for supporting Tabby Chaser! ♡`);
  window.saveCart([]);
  window.toggleCartDrawer(false);
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

window.handleLoginSubmit = function(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const name = email.split('@')[0].toUpperCase();
  localStorage.setItem('tabby_user_session', JSON.stringify({ name: name, email: email, loggedIn: true }));
  window.toggleLoginModal(false);
  initHeaderAccountButton();
  window.location.href = 'account.html';
};

window.handleSignUpSubmit = function(event) {
  event.preventDefault();
  const name = document.getElementById('signUpName').value.trim();
  const email = document.getElementById('signUpEmail').value.trim();
  localStorage.setItem('tabby_user_session', JSON.stringify({ name: name, email: email, loggedIn: true }));
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

  alert("🎁 10% discount for order above 500");

  if (window.renderCartItems) {
    window.renderCartItems();
  }
};


