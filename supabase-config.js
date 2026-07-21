// ==========================================
// SUPABASE CLIENT INITIALIZATION CONFIG
// ==========================================

// Configurable values. Replace with your actual anon key from your Supabase Dashboard.
const SUPABASE_URL = 'https://rjjympjfdmvjuuovidtc.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('tabby_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqanltcGpmZG12anV1b3ZpZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTQ3NDgyNTksImV4cCI6MTk3MDMyNDI1OX0.placeholder_anon_key'; 

let supabase = null;

if (typeof window.supabase !== 'undefined') {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
  }
} else {
  console.warn('⚠️ Supabase JS SDK not loaded. Load CDN before loading config.');
}

// Global accessor
window.supabaseClient = supabase;

// Helper function to allow dynamic key updates from console/admin
window.setSupabaseKey = function(key) {
  localStorage.setItem('tabby_supabase_key', key);
  window.location.reload();
};
