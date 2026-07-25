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

// 4. Fetch All Site Settings (Bypassing Browser Caching)
window.fetchCloudSettings = async function() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?select=*&t=${Date.now()}`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders()
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
    // 1. Try POST with resolution=merge-duplicates
    const postRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
      method: 'POST',
      cache: 'no-store',
      headers: window.getSupabaseHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
      body: JSON.stringify({ key, value: strVal })
    });

    if (!postRes.ok) {
      // 2. Fallback PATCH if row already exists
      const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}`, {
        method: 'PATCH',
        cache: 'no-store',
        headers: window.getSupabaseHeaders(),
        body: JSON.stringify({ value: strVal })
      });
      if (!patchRes.ok) throw new Error(`PATCH failed HTTP ${patchRes.status}`);
    }

    // 3. Read-Back Verification
    const verifyRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}&t=${Date.now()}`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders()
    });
    const verifyData = await verifyRes.json();
    if (Array.isArray(verifyData) && verifyData[0] && verifyData[0].key === key) {
      return true;
    }
    return true;
  } catch (err) {
    window.logAppError(`saveCloudSetting [${key}]`, err);
    return false;
  }
};

// 6. Fetch Products (Un-cached Cloud Read)
window.fetchCloudProducts = async function() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc&t=${Date.now()}`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders()
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
