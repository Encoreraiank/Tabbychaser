// ==========================================
// CLOUDINARY CLIENT-SIDE CONFIGURATION
// ==========================================

// Configurable values. Replace with your actual Cloudinary Cloud Name & Unsigned Upload Preset.
const CLOUDINARY_CLOUD_NAME = localStorage.getItem('tabby_cloudinary_name') || 'rjjympjfdmvjuuovidtc'; // Fallback to their project storage namespace
const CLOUDINARY_UPLOAD_PRESET = localStorage.getItem('tabby_cloudinary_preset') || 'tabby_unsigned_preset';

// Global accessors
window.cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET
};

// Helper function to allow dynamic keys updates from console/admin
window.setCloudinaryKeys = function(cloudName, uploadPreset) {
  localStorage.setItem('tabby_cloudinary_name', cloudName);
  localStorage.setItem('tabby_cloudinary_preset', uploadPreset);
  console.log('✅ Cloudinary credentials updated successfully!');
  window.location.reload();
};
