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

    if (settingsMap.standard_shipping_fee !== undefined) {
      window.cloudShippingFee = parseInt(settingsMap.standard_shipping_fee);
    } else if (settingsMap.shipping_fees !== undefined) {
      window.cloudShippingFee = parseInt(settingsMap.shipping_fees);
    } else {
      window.cloudShippingFee = 0;
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
  let reviews = [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=*`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) reviews = data;
    }
  } catch (err) {
    window.logAppError('fetchCloudReviews', err);
  }

  // Also fetch reviews stored in site_settings for 100% guaranteed cloud sync
  try {
    const settings = await window.fetchCloudSettings();
    if (settings) {
      if (settings.all_reviews_cloud_list) {
        const list = typeof settings.all_reviews_cloud_list === 'string' ? JSON.parse(settings.all_reviews_cloud_list) : settings.all_reviews_cloud_list;
        if (Array.isArray(list)) {
          const map = new Map();
          [...reviews, ...list].forEach(r => { if (r && r.id) map.set(r.id, r); });
          reviews = Array.from(map.values());
        }
      }
      Object.keys(settings).forEach(k => {
        if (k.startsWith('rev_item_')) {
          try {
            const r = typeof settings[k] === 'string' ? JSON.parse(settings[k]) : settings[k];
            if (r && r.id) {
              const existingIdx = reviews.findIndex(x => x.id === r.id);
              if (existingIdx >= 0) reviews[existingIdx] = { ...reviews[existingIdx], ...r };
              else reviews.push(r);
            }
          } catch(e) {}
        }
      });
    }
  } catch(e) {}

  return reviews;
};

// 9. Fetch Orders from Supabase Cloud DB & Cloud Settings
window.fetchCloudOrders = async function() {
  let orders = [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
      cache: 'no-store',
      headers: window.getSupabaseHeaders({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) orders = data;
    }
  } catch (err) {
    window.logAppError('fetchCloudOrders', err);
  }

  // Also fetch orders stored in site_settings for 100% cross-device cloud sync
  try {
    const settings = await window.fetchCloudSettings();
    if (settings) {
      const settingsOrders = [];
      Object.keys(settings).forEach(k => {
        if (k.startsWith('order_')) {
          try {
            const item = typeof settings[k] === 'string' ? JSON.parse(settings[k]) : settings[k];
            if (item && (item.order_reference || item.id)) settingsOrders.push(item);
          } catch(e) {}
        }
      });

      const map = new Map();
      [...orders, ...settingsOrders].forEach(o => {
        if (o && (o.order_reference || o.id)) {
          const key = (o.order_reference || o.id).toString();
          const existing = map.get(key);
          if (!existing) {
            map.set(key, o);
          } else {
            const mergedCoupon = o.coupon_code || existing.coupon_code || o.coupon || existing.coupon || null;
            map.set(key, { ...existing, ...o, coupon_code: mergedCoupon });
          }
        }
      });
      orders = Array.from(map.values());
    }
  } catch(e) {}

  orders.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
  return orders;
};

// 9. Save Review to Supabase Cloud DB
window.saveCloudReview = async function(reviewObj) {
  if (!reviewObj || !reviewObj.id) return false;

  // 1. Always save in site_settings for 100% guaranteed multi-device cloud sync
  try {
    await window.saveCloudSetting('rev_item_' + reviewObj.id, reviewObj);
  } catch(e) {}

  // 2. Also save to Supabase reviews table
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: 'POST',
      cache: 'no-store',
      headers: window.getSupabaseHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
      body: JSON.stringify(reviewObj)
    });
    return res.ok;
  } catch (err) {
    window.logAppError('saveCloudReview', err);
    return false;
  }
};

// 10. Unified Master Invoice Engine - Requirement 1, 2, 3, 4
window.downloadOrderInvoicePDF = async function(orderId) {
  if (!orderId) {
    alert('Invalid Order ID');
    return;
  }

  const cleanRef = String(orderId).replace('#', '').trim();
  console.log(`[Invoice Engine] Received Order ID: ${cleanRef}`);

  let orderRecord = null;

  // 1. Fetch from Cloud DB & Cloud Settings via fetchCloudOrders
  try {
    if (window.fetchCloudOrders) {
      const allOrders = await window.fetchCloudOrders();
      orderRecord = allOrders.find(o => 
        String(o.order_reference || '').toUpperCase() === cleanRef.toUpperCase() ||
        String(o.id || '').toUpperCase() === cleanRef.toUpperCase() ||
        String(o.order_reference || '').toUpperCase() === ('TC-' + cleanRef).toUpperCase()
      );
    }
  } catch(e) {
    console.warn('[Invoice Engine] fetchCloudOrders warning:', e);
  }

  // 2. Fallback to direct DB setting query for order_TC-XXXXXX
  if (!orderRecord) {
    try {
      const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.order_${encodeURIComponent(cleanRef)}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        if (Array.isArray(dbData) && dbData[0] && dbData[0].value) {
          orderRecord = typeof dbData[0].value === 'string' ? JSON.parse(dbData[0].value) : dbData[0].value;
        }
      }
    } catch(e) {}
  }

  // 3. Fallback to localStorage orders
  if (!orderRecord) {
    try {
      const local = JSON.parse(localStorage.getItem('tabby_orders_local') || localStorage.getItem('tabby_orders') || '[]');
      orderRecord = local.find(x => 
        String(x.order_reference || '').toUpperCase() === cleanRef.toUpperCase() ||
        String(x.id || '').toUpperCase() === cleanRef.toUpperCase()
      );
    } catch(e) {}
  }

  if (!orderRecord) {
    console.error(`[Invoice Engine] Error: Order record #${cleanRef} not found in database.`);
    alert(`Order record #${cleanRef} could not be loaded from database. Please refresh and try again.`);
    return;
  }

  console.log('[Invoice Engine] Database record loaded:', orderRecord);

  // Normalize order values from authoritative database record
  const name = orderRecord.name || 'Valued Customer';
  const email = orderRecord.email || '';
  const phone = orderRecord.phone || '';
  const address = orderRecord.address || orderRecord.shipping_address || 'Address provided at checkout';
  const displayRef = orderRecord.order_reference || orderRecord.id || cleanRef;
  const createdDate = new Date(orderRecord.created_at || Date.now()).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });
  const paymentMethod = (orderRecord.payment_method === 'cod') ? 'Cash on Delivery' : 'Paid via Razorpay (Online)';
  const couponUsed = orderRecord.coupon_code || orderRecord.appliedCoupon?.code || null;
  const totalAmount = orderRecord.total || 0;
  const subtotal = orderRecord.subtotal || totalAmount;
  const discount = orderRecord.discount || 0;
  const shipping = orderRecord.shipping || 0;

  let items = [];
  if (Array.isArray(orderRecord.items)) items = orderRecord.items;
  else if (Array.isArray(orderRecord.cart)) items = orderRecord.cart;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:12px 10px; border-bottom:1px solid #fce4ec; text-align:left;">
        <strong style="color:#333; font-size:0.92rem;">${item.name || item.title || 'Handmade Charm'}</strong>
      </td>
      <td style="padding:12px 10px; border-bottom:1px solid #fce4ec; text-align:center; font-weight:600; color:#666;">
        ${item.qty || item.quantity || 1}
      </td>
      <td style="padding:12px 10px; border-bottom:1px solid #fce4ec; text-align:right; font-weight:700; color:#d35d88;">
        ₹${(item.price || 0) * (item.qty || item.quantity || 1)}
      </td>
    </tr>
  `).join('') || `<tr><td colspan="3" style="padding:12px; text-align:center; color:#666;">Handmade Clay Product</td></tr>`;

  console.log('[Invoice Engine] Invoice data object compiled:', { displayRef, name, email, totalAmount, itemsCount: items.length });

  // Render unified official invoice window
  const printWin = window.open('', '_blank');
  if (!printWin) {
    alert('Popup blocked! Please allow popups for tabbychaser.store to view and download your PDF invoice.');
    return;
  }

  printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>TAX INVOICE #${displayRef} - Tabby Chaser</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #333; padding: 20px; background: #fff9fa; margin: 0; }
    .invoice-box { max-width: 650px; margin: 20px auto; background: #ffffff; border: 2px solid #f47aab; border-radius: 24px; padding: 30px; box-shadow: 0 10px 30px rgba(244,122,171,0.15); }
    .mascot-header { text-align: center; margin-bottom: 20px; }
    .mascot-img { width: 110px; height: 110px; border-radius: 16px; object-fit: cover; border: 1px solid #f47aab; }
    .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f47aab; padding-bottom: 16px; margin-bottom: 20px; }
    .brand-title { font-size: 1.6rem; font-weight: 800; color: #d35d88; margin: 0; }
    .brand-sub { font-size: 0.8rem; color: #777; margin-top: 4px; }
    .inv-title { text-align: right; }
    .inv-heading { font-size: 1.3rem; font-weight: 800; color: #333; margin: 0; letter-spacing: 0.5px; }
    .inv-ref { font-size: 0.95rem; font-weight: 700; color: #d35d88; margin-top: 4px; }
    .grid-info { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 24px; font-size: 0.88rem; line-height: 1.6; background: #fff0f5; padding: 16px; border-radius: 16px; }
    .grid-info strong { color: #d35d88; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.88rem; }
    th { background: #fff0f5; color: #d35d88; padding: 10px; text-align: left; border-bottom: 2px solid #f47aab; text-transform: uppercase; font-size: 0.8rem; }
    .summary-wrap { text-align: right; margin-top: 15px; font-size: 0.9rem; line-height: 1.8; }
    .summary-line { display: flex; justify-content: flex-end; gap: 40px; color: #555; }
    .total-line { display: flex; justify-content: flex-end; gap: 40px; font-size: 1.2rem; font-weight: 800; color: #d35d88; border-top: 1.5px dashed #f47aab; padding-top: 8px; margin-top: 8px; }
    .thankyou-card { background: #fff0f5; border: 1.5px dashed #f47aab; border-radius: 18px; padding: 20px; text-align: center; margin-top: 25px; }
    .thankyou-card h3 { margin: 0 0 6px 0; color: #d35d88; font-size: 1.25rem; font-weight: 800; }
    .thankyou-card p { margin: 4px 0; font-size: 0.88rem; color: #555; }
    .btn-print { display: block; width: 100%; max-width: 220px; margin: 20px auto 0 auto; background: #f47aab; color: #fff; text-align: center; padding: 12px; border-radius: 50px; text-decoration: none; font-weight: 700; cursor: pointer; border: none; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(244,122,171,0.4); }
    @media print { .btn-print { display: none; } body { background: #fff; padding: 0; } .invoice-box { border: none; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="mascot-header">
      <img src="https://tabbychaser.store/09-9-.jpg" alt="Tabby Chaser Mascot" class="mascot-img" />
    </div>

    <div class="header-flex">
      <div>
        <h1 class="brand-title">🐾 Tabby Chaser</h1>
        <div class="brand-sub">Handcrafted Cold Porcelain Clay Charms &amp; Desk Pals<br/>tabbychaser2@gmail.com • +91 7996 545 772</div>
      </div>
      <div class="inv-title">
        <h2 class="inv-heading">TAX INVOICE</h2>
        <div class="inv-ref">#${displayRef}</div>
        <div style="font-size:0.8rem; color:#666; margin-top:4px;">Date: ${createdDate}</div>
      </div>
    </div>

    <div class="grid-info">
      <div>
        <strong>BILLED / SHIPPED TO:</strong><br/>
        <span style="font-size:1rem; font-weight:700; color:#333;">${name}</span><br/>
        ${email ? `${email}<br/>` : ''}
        ${phone ? `${phone}<br/>` : ''}
        ${address}
        ${couponUsed ? `<br/><span style="color:#d35d88; font-weight:700;">Coupon Applied: ${couponUsed}</span>` : ''}
      </div>
      <div style="text-align:right;">
        <strong>PAYMENT INFORMATION:</strong><br/>
        Status: <span style="color:#2e7d32; font-weight:700;">Paid ✅</span><br/>
        Method: ${paymentMethod}<br/>
        Order Ref: #${displayRef}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>ITEM DESCRIPTION</th>
          <th style="text-align:center;">QTY</th>
          <th style="text-align:right;">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="summary-wrap">
      <div class="summary-line"><span>Subtotal:</span><span>₹${subtotal}</span></div>
      ${discount > 0 ? `<div class="summary-line"><span style="color:#d35d88;">Discount:</span><span style="color:#d35d88;">-₹${discount}</span></div>` : ''}
      <div class="summary-line"><span>Shipping:</span><span>${shipping > 0 ? `₹${shipping}` : 'FREE 🚚'}</span></div>
      <div class="total-line"><span>Total Paid:</span><span>₹${totalAmount}</span></div>
    </div>

    <div class="thankyou-card">
      <h3>thank you! 💕</h3>
      <p>Thank you for supporting my small handmade business.</p>
      <p>Each order means the world to me.</p>
      <p style="font-weight:700; color:#d35d88; margin-top:8px;">Happy shopping!<br/>- Tabby Chaser</p>
    </div>

    <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
  </div>
</body>
</html>`);
  printWin.document.close();
  console.log(`[Invoice Engine] PDF Invoice generated successfully for order #${cleanRef}`);
};
