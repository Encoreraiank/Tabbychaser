// ==========================================================================
// Tabby Chaser E-Commerce Engine
// Step 2: Smooth Crossfade Slideshow Logic (No Layout Shift)
// ==========================================================================

let currentSlideIdx = 0;
let slideInterval;
const totalSlides = 4;

document.addEventListener('DOMContentLoaded', () => {
  console.log("Tabby Chaser Step 2 initialized.");
  
  // Set simple cart quantity
  const cartQty = localStorage.getItem('tabby_cart_qty') || 0;
  const countBadge = document.querySelector('.cart-badge');
  if (countBadge) {
    countBadge.textContent = cartQty;
  }

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
