// ==========================================
// SUPABASE CLIENT INITIALIZATION CONFIG
// ==========================================

const SUPABASE_URL = 'https://rjjympjfdmvjuuovidtc.supabase.co';
const SUPABASE_ANON_KEY = localStorage.getItem('tabby_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqanltcGpmZG12anV1b3ZpZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTQ3NDgyNTksImV4cCI6MTk3MDMyNDI1OX0.placeholder_anon_key'; 

function initSupabaseClient() {
  if (typeof window.supabase !== 'undefined') {
    try {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase client initialized successfully!');
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

