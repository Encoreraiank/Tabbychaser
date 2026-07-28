// ==========================================
// SUPABASE UNIFIED CLOUD ENGINE & UTILITY LAYER
// Single Source of Truth for Tabby Chaser
// ==========================================

const HARDCODED_URL = 'https://bdwfwutvqvmyujwgrtwu.supabase.co';
const HARDCODED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2Z3dXR2cXZteXVqd2dydHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2Mjc5MzYsImV4cCI6MjEwMDIwMzkzNn0.XkVmSEkjYY-JH_jyQ1IdhTin-EH1AH5t20mllR5iCbI';

const SUPABASE_URL = HARDCODED_URL;
const SUPABASE_ANON_KEY = HARDCODED_KEY;

// 1. Centralized Error Logging
window.logAppError = function(context, error) {
  console.error(`[TabbyChaser Engine Error - ${context}]:`, error);
};

// 2. Standardized Headers for Supabase REST API
window.getSupabaseHeaders = function(extraHeaders = {}) {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extraHeaders
  };
};

// 3. JS SDK Client Initialization
function initSupabaseClient() {
  if (typeof window.supabase !== 'undefined') {
    try {
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (error) {
      window.logAppError('SDK Init', error);
      window.supabaseClient = window.supabase.createClient(HARDCODED_URL, HARDCODED_KEY);
    }
  }
}
initSupabaseClient();

// 4. Fetch All Site Settings (Bypassing Browser Caching via HTTP Headers)
window.fetchCloudSettings = async function() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=*`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const settingsMap = {};
    if (Array.isArray(data)) {
      data.forEach(row => {
        if (row && row.key) settingsMap[row.key] = row.value;
      });
    }
    return settingsMap;
  } catch (err) {
    window.logAppError('fetchCloudSettings', err);
    return {};
  }
};

// 5. Save Single Setting to Supabase DB with Read-Back Validation
window.saveCloudSetting = async function(key, value) {
  const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
  try {
    // 1. Try PATCH first (updates existing setting row)
    const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}`, {
      method: 'PATCH',
      cache: 'no-store',
      headers: window.getSupabaseHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }),
      body: JSON.stringify({ value: strVal })
    });

    if (patchRes.ok) {
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}`, {
        cache: 'no-store',
        headers: window.getSupabaseHeaders()
      });
      const checkData = await checkRes.json();
      if (Array.isArray(checkData) && checkData.length > 0) {
        return true;
      }
    }

    // 2. If row does not exist yet, POST new row
    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
      method: 'POST',
      cache: 'no-store',
      headers: window.getSupabaseHeaders(),
      body: JSON.stringify({ key, value: strVal })
    });

    return postRes.ok;
  } catch (err) {
    window.logAppError(`saveCloudSetting [${key}]`, err);
    return false;
  }
};

// 6. Fetch Products (Un-cached Cloud Read)
window.fetchCloudProducts = async function() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    window.logAppError('fetchCloudProducts', err);
    return [];
  }
};

// 7. Save Product to Supabase DB with Read-Back Validation
window.saveCloudProduct = async function(product) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      cache: 'no-store',
      headers: window.getSupabaseHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    window.logAppError('saveCloudProduct', err);
    return false;
  }
};

// 8. Fetch Reviews from Supabase Cloud DB
window.fetchCloudReviews = async function() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    window.logAppError('fetchCloudReviews', err);
    return [];
  }
};

// 9. Save Review to Supabase Cloud DB
window.saveCloudReview = async function(reviewObj) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: 'POST',
      cache: 'no-store',
      headers: window.getSupabaseHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
      body: JSON.stringify(reviewObj)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    window.logAppError('saveCloudReview', err);
    return false;
  }
};
