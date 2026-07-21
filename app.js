// ==========================================================================
// Tabby Chaser E-Commerce Engine
// smooth crossfade slideshow, global cart drawer management
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
      <div class="cart-summary-row">
        <span>Shipping</span>
        <span id="cartShipping">₹59</span>
      </div>
      <div class="cart-summary-row total-row">
        <span>Total Estimate</span>
        <span id="cartTotal">₹0</span>
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
  
  const shipping = 59;
  const total = subtotal + shipping;

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
