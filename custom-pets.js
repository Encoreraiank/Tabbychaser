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





// Ensure the page initializes with correct pricing estimation
document.addEventListener('DOMContentLoaded', () => {
  updateEstimate();
});
