// Vercel Serverless Function - Resend Transactional Email API Engine
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bdwfwutvqvmyujwgrtwu.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkd2Z3dXR2cXZteXVqd2dydHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2Mjc5MzYsImV4cCI6MjEwMDIwMzkzNn0.XkVmSEkjYY-JH_jyQ1IdhTin-EH1AH5t20mllR5iCbI';

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html, orderId, type, orderData } = req.body || {};

    if (!to || !subject || !html || !orderId) {
      return res.status(400).json({ error: 'Missing required parameters (to, subject, html, orderId)' });
    }

    // 1. Requirement 6: Idempotency Check in Supabase Cloud DB
    try {
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.tabby_email_sent_${encodeURIComponent(orderId)}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const checkData = await checkRes.json();
      if (Array.isArray(checkData) && checkData.length > 0) {
        console.log(`[Resend Engine] Email already sent for order ${orderId}`);
        return res.status(200).json({ success: true, message: 'Email already sent for this order (idempotency check)' });
      }
    } catch(e) {}

    // 2. Fetch Resend API Key from Cloud DB if available
    let apiKey = RESEND_API_KEY;
    try {
      const keyRes = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.resend_api_key`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      const keyData = await keyRes.json();
      if (Array.isArray(keyData) && keyData[0] && keyData[0].value) {
        apiKey = keyData[0].value.trim();
      }
    } catch(e) {}

    if (!apiKey) {
      console.warn('[Resend Engine] No RESEND_API_KEY configured yet. Email logged to DB.');
      return res.status(200).json({ success: false, error: 'No RESEND_API_KEY configured in environment or DB settings.' });
    }

    // 3. Send Email via Resend API (https://api.resend.com/emails)
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tabby Chaser <orders@tabbychaser.store>',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const resendResult = await resendRes.json();

    if (!resendRes.ok) {
      console.error('[Resend Error]', resendResult);
      
      // Fallback: If domain verification is pending, send via onboarding domain
      if (resendResult && resendResult.message && resendResult.message.includes('domain')) {
        const fallbackRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Tabby Chaser <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: html
          })
        });
        const fallbackResult = await fallbackRes.json();
        if (fallbackRes.ok) {
          return res.status(200).json({ success: true, data: fallbackResult });
        }
      }

      return res.status(500).json({ success: false, error: resendResult.message || 'Resend dispatch failed' });
    }

    // 4. Log Idempotency flag in Supabase DB
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: `tabby_email_sent_${orderId}`,
          value: JSON.stringify({ sent_at: new Date().toISOString(), resend_id: resendResult.id })
        })
      });
    } catch(e) {}

    return res.status(200).json({ success: true, data: resendResult });
  } catch (err) {
    console.error('[Email Handler Server Error]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
