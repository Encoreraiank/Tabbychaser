// ==========================================
// CLOUDINARY CLIENT-SIDE CONFIGURATION
// ==========================================

const CLOUDINARY_CLOUD_NAME = localStorage.getItem('tabby_cloudinary_name') || 'atzancff';
const CLOUDINARY_UPLOAD_PRESET = localStorage.getItem('tabby_cloudinary_preset') || 'tabbychaserstore';

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
