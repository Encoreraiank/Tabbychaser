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

  const siteSettings = JSON.parse(localStorage.getItem('tabby_site_settings') || '{}');
  const shippingPrice = parseInt(siteSettings.standard_shipping_fee || '59');

  const sizeVal = form.elements['sizeSelection'].value;
  let basePrice = 450;

  if (sizeVal === 'medium') {
    basePrice = 900;
  } else if (sizeVal === 'large') {
    basePrice = 1350;
  }

  const summaryBasePrice = document.getElementById('summaryBasePrice');
  const summaryTotal = document.getElementById('summaryTotal');
  const shipLabel = document.getElementById('summaryShipLabel');
  const shipVal = document.getElementById('summaryShipVal');

  const baseFormatted = '₹' + basePrice.toLocaleString('en-IN');
  const totalFormatted = '₹' + (basePrice + shippingPrice).toLocaleString('en-IN');

  if (summaryBasePrice) summaryBasePrice.textContent = baseFormatted;
  if (summaryTotal) summaryTotal.textContent = totalFormatted;
  if (shipLabel) shipLabel.textContent = `Shipping charges - Rs ${shippingPrice}`;
  if (shipVal) shipVal.textContent = `₹${shippingPrice}`;
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
// Global array to store uploaded pet photos URLs
window.uploadedPetPhotos = [];

// Helper function to upload image file to Cloudinary
async function uploadImageToCloudinary(file) {
  const cloudName = window.cloudinaryConfig ? window.cloudinaryConfig.cloudName : 'rjjympjfdmvjuuovidtc';
  const preset = window.cloudinaryConfig ? window.cloudinaryConfig.uploadPreset : 'tabby_unsigned_preset';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

// ---- SUBMIT INQUIRY FORM ----
async function submitInquiry(event) {
  event.preventDefault();
  
  const form = document.getElementById('petPlannerForm');
  if (!form) return;

  const submitBtn = form.querySelector('.btn-planner-submit');
  const sizeVal = form.elements['sizeSelection'].value;
  const details = document.getElementById('charmDetails').value.trim();
  const additional = document.getElementById('additionalRequests').value.trim();

  let basePrice = 450;
  const shippingPrice = 59;
  if (sizeVal === 'medium') {
    basePrice = 900;
  } else if (sizeVal === 'large') {
    basePrice = 1350;
  }
  const totalPrice = basePrice + shippingPrice;

  // Retrieve user session
  const session = JSON.parse(localStorage.getItem('tabby_user_session'));
  const userEmail = session ? session.email : 'guest@example.com';

  // Gather files to upload
  const filesToUpload = [];
  for (let i = 1; i <= 6; i++) {
    const input = document.getElementById(`photo-input-${i}`);
    if (input && input.files && input.files[0]) {
      filesToUpload.push(input.files[0]);
    }
  }

async function uploadImageToCloudinary(file) {
  const cloudName = window.cloudinaryConfig?.cloudName || localStorage.getItem('tabby_cloudinary_name') || 'atzancff';
  const preset = window.cloudinaryConfig?.uploadPreset || localStorage.getItem('tabby_cloudinary_preset') || 'tabbychaserstore';
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.secure_url) return data.secure_url;
    throw new Error(data.error?.message || 'Upload failed');
  } catch(err) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }
}

  if (filesToUpload.length > 0) {
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    
    // Upload files sequentially to Cloudinary
    for (let idx = 0; idx < filesToUpload.length; idx++) {
      submitBtn.textContent = `Uploading pet photos (${idx + 1} of ${filesToUpload.length})... ⏳`;
      try {
        const url = await uploadImageToCloudinary(filesToUpload[idx]);
        window.uploadedPetPhotos.push(url);
      } catch (err) {
        console.warn('Cloudinary upload failed for index', idx, 'falling back. Error:', err.message);
        // Fallback dummy URL to prevent blocking user submission
        window.uploadedPetPhotos.push(`https://via.placeholder.com/600x600.png?text=Photo+Upload+Failed`);
      }
    }
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }

  // Save to Supabase custom_orders table
  if (window.supabaseClient) {
    try {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      const customOrderRecord = {
        user_id: user ? user.id : null,
        email: userEmail,
        pet_name: details.substring(0, 100) || 'Custom Pet Order',
        pet_type: sizeVal.toUpperCase(),
        special_notes: `Details: ${details}\n\nAdditional Requests: ${additional}\n\nUploaded Images: ${window.uploadedPetPhotos.join(', ')}`,
        subtotal: basePrice,
        shipping: shippingPrice,
        total: totalPrice,
        status: 'pending'
      };

      const { error } = await window.supabaseClient
        .from('custom_orders')
        .insert(customOrderRecord);
      if (error) throw error;
      console.log('✅ Custom order saved to Supabase database!');
    } catch (err) {
      console.error('Error saving custom order to Supabase:', err.message);
    }
  }

  // Display Success Modal
  const modal = document.getElementById('successModal');
  if (modal) modal.classList.add('show-modal');
}

// ---- SEND EMAIL DISPATCH ----
function sendEmail() {
  const form = document.getElementById('petPlannerForm');
  if (!form) return;

  const details = document.getElementById('charmDetails').value.trim();
  const additional = document.getElementById('additionalRequests').value.trim();
  const sizeVal = form.elements['sizeSelection'].value;
  const sizeText = sizeVal.toUpperCase();

  const subject = encodeURIComponent("Tabby Chaser - Custom Charm Request Inquiry");
  
  let bodyText = `Hi Tabby Chaser,\n\nI would like to place a custom charm request! Here are my details:\n\n`;
  bodyText += `• Size Selected: ${sizeText}\n`;
  bodyText += `• Charm Details:\n${details}\n\n`;
  if (additional) {
    bodyText += `• Additional Requests:\n${additional}\n\n`;
  }

  // Append hosted Cloudinary image links
  if (window.uploadedPetPhotos && window.uploadedPetPhotos.length > 0) {
    bodyText += `• Reference Photos (Hosted on Cloudinary):\n`;
    window.uploadedPetPhotos.forEach((url, i) => {
      bodyText += `  - Photo ${i + 1}: ${url}\n`;
    });
    bodyText += `\n`;
  } else {
    bodyText += `• Reference Photos: No photos uploaded.\n\n`;
  }

  bodyText += `Thank you!`;
  
  const body = encodeURIComponent(bodyText);
  
  // Open mailto link
  window.open(`mailto:tabbychaser2@gmail.com?subject=${subject}&body=${body}`, '_blank');
  closeModal();
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
