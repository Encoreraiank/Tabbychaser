/* ==========================================================================
   Tabby Chaser – Custom Pets JavaScript
   Planner Calculator, FAQ Accordions, and Inquiry Modal
   ========================================================================== */

// ---- ESTIMATION CALCULATOR ----
function updateEstimate() {
  const form = document.getElementById('petPlannerForm');
  if (!form) return;

  const tierType = form.elements['tierType'].value;
  let basePrice = 999;

  if (tierType === 'tier2') {
    basePrice = 1499;
  } else if (tierType === 'tier3') {
    basePrice = 2499;
  }

  // Update summary fields
  const summaryBasePrice = document.getElementById('summaryBasePrice');
  const summaryTotal = document.getElementById('summaryTotal');

  if (summaryBasePrice) summaryBasePrice.textContent = '₹' + basePrice;
  if (summaryTotal) summaryTotal.textContent = '₹' + basePrice;
}

function selectTier(tierId) {
  // Update class of tier selections
  const options = document.querySelectorAll('.tier-option');
  options.forEach(opt => {
    const input = opt.querySelector('input');
    if (input && input.value === tierId) {
      opt.classList.add('active-tier');
      input.checked = true;
    } else {
      opt.classList.remove('active-tier');
    }
  });

  updateEstimate();
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
  
  const petNameInput = document.getElementById('petName');
  const petName = petNameInput ? petNameInput.value.trim() : 'your pet';

  // Display Success Modal
  const modal = document.getElementById('successModal');
  const modalPetName = document.getElementById('modalPetName');
  
  if (modalPetName) modalPetName.textContent = petName;
  if (modal) modal.classList.add('show-modal');
}

function closeModal() {
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.remove('show-modal');
  
  // Reset form
  const form = document.getElementById('petPlannerForm');
  if (form) form.reset();
  
  selectTier('tier1');
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
  cols.forEach(c => track.appendChild(c));
  // Duplicate for seamless infinite loop scroll
  cols.forEach(c => {
    const d = c.cloneNode(true);
    d.setAttribute('aria-hidden', 'true');
    track.appendChild(d);
  });

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
