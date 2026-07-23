// ==========================================
// CLOUDINARY CLIENT-SIDE CONFIGURATION
// ==========================================

const HARDCODED_CLOUD_NAME = 'atzancff';
const HARDCODED_UPLOAD_PRESET = 'tabbychaserstore';

const savedName = localStorage.getItem('tabby_cloudinary_name');
const savedPreset = localStorage.getItem('tabby_cloudinary_preset');

const CLOUDINARY_CLOUD_NAME = (savedName && savedName.trim()) ? savedName.trim() : HARDCODED_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = (savedPreset && savedPreset.trim()) ? savedPreset.trim() : HARDCODED_UPLOAD_PRESET;

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
