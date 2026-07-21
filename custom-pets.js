/* ==========================================================================
   Tabby Chaser – Custom Pets JavaScript
   Planner Calculator, FAQ Accordions, and Inquiry Modal
   ========================================================================== */

// ---- DYNAMIC PHOTO UPLOADS PREVIEW ----
function triggerFileInput(index) {
  const input = document.getElementById(`photo-input-${index}`);
  if (input) input.click();
}

function handlePhotoChange(input, index) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById(`slot-preview-${index}`);
      const defContent = document.getElementById(`slot-default-${index}`);
      const clearBtn = document.getElementById(`slot-clear-${index}`);
      
      if (preview) {
        preview.style.backgroundImage = `url('${e.target.result}')`;
        preview.style.display = 'block';
      }
      if (defContent) defContent.style.display = 'none';
      if (clearBtn) clearBtn.style.display = 'flex';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function clearPhoto(event, index) {
  event.stopPropagation(); // Avoid opening file picker
  
  const input = document.getElementById(`photo-input-${index}`);
  const preview = document.getElementById(`slot-preview-${index}`);
  const defContent = document.getElementById(`slot-default-${index}`);
  const clearBtn = document.getElementById(`slot-clear-${index}`);
  
  if (input) input.value = '';
  if (preview) {
    preview.style.backgroundImage = 'none';
    preview.style.display = 'none';
  }
  if (defContent) defContent.style.display = 'flex';
  if (clearBtn) clearBtn.style.display = 'none';
}

// ---- TEXTAREA COUNTERS ----
function updateTextareaCounter(textarea, counterId) {
  const counter = document.getElementById(counterId);
  if (counter) {
    const len = textarea.value.length;
    const max = textarea.getAttribute('maxlength') || 1000;
    counter.textContent = `${len} / ${max}`;
  }
}

// ---- SIZE SELECTION AND ESTIMATE SUMMARY ----
function selectSize(size) {
  const sizeCards = document.querySelectorAll('.size-card');
  sizeCards.forEach(card => {
    const input = card.querySelector('input');
    if (input && input.value === size) {
      card.classList.add('active');
      input.checked = true;
    } else {
      card.classList.remove('active');
    }
  });
  updateEstimate();
}

function updateEstimate() {
  const form = document.getElementById('petPlannerForm');
  if (!form) return;

  const sizeVal = form.elements['sizeSelection'].value;
  let basePrice = 450;

  if (sizeVal === 'medium') {
    basePrice = 900;
  } else if (sizeVal === 'large') {
    basePrice = 1350;
  }

  const summaryBasePrice = document.getElementById('summaryBasePrice');
  const summaryTotal = document.getElementById('summaryTotal');

  const priceFormatted = '₹' + basePrice.toLocaleString('en-IN');

  if (summaryBasePrice) summaryBasePrice.textContent = priceFormatted;
  if (summaryTotal) summaryTotal.textContent = priceFormatted;
}

// ---- FAQ ACCORDION TOGGLE ----
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isActive = item.classList.contains('active-faq');

  // Collapse all FAQs first
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('active-faq');
    const answer = i.querySelector('.faq-answer');
    if (answer) answer.style.maxHeight = null;
  });

  // If clicked item wasn't active, expand it
  if (!isActive) {
    item.classList.add('active-faq');
    const answer = item.querySelector('.faq-answer');
    if (answer) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  }
}

// ---- SUBMIT INQUIRY FORM ----
function submitInquiry(event) {
  event.preventDefault();
  
  // Display Success Modal
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.add('show-modal');
}

function closeModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('show-modal');
  
  // Reset form
  const form = document.getElementById('petPlannerForm');
  if (form) {
    form.reset();
    
    // Clear all image slots preview
    for (let i = 1; i <= 6; i++) {
      const preview = document.getElementById(`slot-preview-${i}`);
      const defContent = document.getElementById(`slot-default-${i}`);
      const clearBtn = document.getElementById(`slot-clear-${i}`);
      const input = document.getElementById(`photo-input-${i}`);
      
      if (preview) {
        preview.style.backgroundImage = 'none';
        preview.style.display = 'none';
      }
      if (defContent) defContent.style.display = 'flex';
      if (clearBtn) clearBtn.style.display = 'none';
      if (input) input.value = '';
    }
    
    // Reset character counters
    const charmDetailsCounter = document.getElementById('charmDetailsCounter');
    const additionalRequestsCounter = document.getElementById('additionalRequestsCounter');
    if (charmDetailsCounter) charmDetailsCounter.textContent = '0 / 1000';
    if (additionalRequestsCounter) additionalRequestsCounter.textContent = '0 / 500';
  }
  
  selectSize('small');
}

// ---- HAPPY COMMISSIONS SCROLLING MASONRY WALL ----
function initHappyCommissionsWall() {
  const wall = document.querySelector('[data-tc-pets-wall]');
  if (!wall) return;
  const track = wall.querySelector('[data-tc-pets-wall-track]');
  const imgs = Array.from(track.children);
  if (imgs.length < 4) return;

  const small = window.matchMedia('(max-width: 749px)').matches;
  const H = small ? 320 : 460;   // resting wall height
  const W = small ? 128 : 190;   // column width
  const GAP = 12;                // column gap spacing
  wall.style.height = H + 'px';

  // Shuffle images
  for (let i = imgs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = imgs[i]; imgs[i] = imgs[j]; imgs[j] = t;
  }

  const pool = imgs.slice();
  let recycle = 0;
  const cols = [];
  const colCount = Math.ceil(imgs.length / 2.0); // e.g. 5 columns

  for (let c = 0; c < colCount; c++) {
    const col = document.createElement('div');
    col.className = 'tc-pets__wall-col';
    col.style.paddingTop = Math.round(Math.random() * 56) + 'px';
    let used = -GAP;
    let first = true;
    while (used < H + 140) {
      let img;
      if (pool.length) {
        img = pool.shift();
      } else {
        img = imgs[recycle++ % imgs.length].cloneNode(true);
        img.removeAttribute('aria-hidden');
        img.setAttribute('aria-hidden', 'true');
      }
      const frac = first ? (0.22 + Math.random() * 0.5) : (0.3 + Math.random() * 0.28);
      first = false;
      img.style.height = Math.round(H * frac) + 'px';
      img.style.width = W + 'px';
      col.appendChild(img);
      used += Math.round(H * frac) + GAP;
    }
    cols.push(col);
  }

  track.innerHTML = '';
  // Append 4 sets of columns to ensure the track is very wide and never leaves empty gaps on high-resolution screens
  for (let repeat = 0; repeat < 4; repeat++) {
    cols.forEach(c => {
      const d = c.cloneNode(true);
      if (repeat > 0) {
        d.setAttribute('aria-hidden', 'true');
      }
      track.appendChild(d);
    });
  }

  function halfWidth() {
    const isSmall = window.matchMedia('(max-width: 749px)').matches;
    const currentW = isSmall ? 128 : 190;
    const currentGAP = 12;
    return colCount * (currentW + currentGAP);
  }

  const SPEED = 40; // px per second auto-cruise speed
  let offset = Math.random() * 200;
  let vel = SPEED;
  let dragging = false;
  let lastT = 0;
  let startX = 0;
  let startOffset = 0;

  function apply() {
    const w = halfWidth();
    offset = ((offset % w) + w) % w;
    track.style.transform = 'translateX(' + (-offset) + 'px)';
  }

  function tick(t) {
    if (lastT) {
      const dt = (t - lastT) / 1000;
      if (!dragging) {
        vel += (SPEED - vel) * Math.min(1, dt * 1.8);
        offset += vel * dt;
        apply();
      }
    }
    lastT = t;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  apply();

  // ---- Drag to scroll handlers ----
  wall.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX;
    startOffset = offset;
    wall.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    offset = startOffset - dx;
    apply();
  });

  window.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      wall.style.cursor = 'grab';
    }
  });

  // Touch support for mobile devices
  wall.addEventListener('touchstart', (e) => {
    dragging = true;
    startX = e.touches[0].clientX;
    startOffset = offset;
  });

  wall.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    offset = startOffset - dx;
    apply();
  });

  wall.addEventListener('touchend', () => {
    dragging = false;
  });


}

// Ensure the page initializes correctly
document.addEventListener('DOMContentLoaded', () => {
  updateEstimate();
  initHappyCommissionsWall();
});
