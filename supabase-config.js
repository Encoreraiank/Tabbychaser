// ==========================================
// SUPABASE CLIENT INITIALIZATION CONFIG
// ==========================================

const SUPABASE_URL = localStorage.getItem('tabby_supabase_url') || 'https://bdwfwutvqvmyujwgrtwu.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('tabby_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2Z3dXR2cXZteXVqd2dydHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2Mjc5MzYsImV4cCI6MjEwMDIwMzkzNn0.XkVmSEkjYY-JH_jyQ1IdhTin-EH1AH5t20mllR5iCbI'; 

function initSupabaseClient() {
  if (typeof window.supabase !== 'undefined') {
    try {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase client connected successfully to bdwfwutvqvmyujwgrtwu!');
    } catch (error) {
      console.error('❌ Error initializing Supabase client:', error);
    }
  } else {
    console.warn('⚠️ Supabase JS SDK not loaded yet.');
  }
}

initSupabaseClient();

// Helper function to update Supabase key
window.setSupabaseKey = function(key) {
  if (key) {
    localStorage.setItem('tabby_supabase_key', key);
    initSupabaseClient();
    alert('✅ Supabase key updated!');
    window.location.reload();
  }
};
