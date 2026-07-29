/* ==========================================================================
   Tabby Chaser - Production Transactional Email Service (Resend API Engine)
   ========================================================================== */

(function () {
  'use strict';

  const STORE_NAME = 'Tabby Chaser';
  const STORE_URL = 'https://tabbychaser.store';
  const MASCOT_IMG_URL = 'https://tabbychaser.store/add-to-cart.jpg';
  const SUPPORT_EMAIL = 'tabbychaser2@gmail.com';
  const SUPPORT_PHONE = '+91 7996 545 772';

  const TabbyEmailService = {
    // 1. Generate Responsive HTML Email Template
    generateOrderConfirmationHtml: function (orderData) {
      const name = orderData.name || 'Valued Customer';
      const orderId = orderData.order_reference || orderData.id || 'TC-100000';
      const email = orderData.email || '';
      const phone = orderData.phone || '';
      const address = orderData.address || 'Address provided at checkout';
      const createdDate = new Date(orderData.created_at || Date.now()).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short'
      });
      const paymentMethod = (orderData.payment_method === 'cod') ? 'Cash on Delivery' : 'Paid via Razorpay (Online)';
      const totalAmount = orderData.total || 0;
      const subtotal = orderData.subtotal || totalAmount;
      const discount = orderData.discount || 0;
      const shipping = orderData.shipping || 0;

      let items = [];
      if (Array.isArray(orderData.items)) items = orderData.items;
      else if (Array.isArray(orderData.cart)) items = orderData.cart;

      const itemsRowsHtml = items.map(item => {
        const itemTitle = item.name || item.title || 'Handmade Charm';
        const itemQty = item.qty || item.quantity || 1;
        const itemPrice = item.price || 0;
        const itemImg = item.image || item.img || MASCOT_IMG_URL;

        return `
          <tr>
            <td style="padding: 12px 10px; border-bottom: 1px solid #fce4ec; vertical-align: middle;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${itemImg}" alt="${itemTitle}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid #f47aab;" />
                <span style="font-weight: 600; color: #333; font-size: 0.9rem;">${itemTitle}</span>
              </div>
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #fce4ec; text-align: center; font-weight: 600; color: #666; font-size: 0.9rem;">
              x${itemQty}
            </td>
            <td style="padding: 12px 10px; border-bottom: 1px solid #fce4ec; text-align: right; font-weight: 700; color: #d35d88; font-size: 0.9rem;">
              ₹${itemPrice * itemQty}
            </td>
          </tr>
        `;
      }).join('') || `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #666;">Handmade Clay Product</td></tr>`;

      const invoiceUrl = `${STORE_URL}/checkout?action=invoice&id=${orderId}`;

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed! - #${orderId}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, Roboto, Helvetica, sans-serif; background-color: #fff9fa; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; }
    .wrapper { width: 100%; background-color: #fff9fa; padding: 30px 10px; }
    .card { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; border: 1.5px solid #f47aab; box-shadow: 0 12px 35px rgba(244,122,171,0.12); overflow: hidden; }
    .header-banner { background: #fff0f5; text-align: center; padding: 25px 20px 15px 20px; border-bottom: 1px solid #fce4ec; }
    .mascot-img { width: 150px; height: 150px; border-radius: 16px; object-fit: contain; }
    .brand-title { font-size: 1.6rem; font-weight: 800; color: #d35d88; margin: 10px 0 4px 0; letter-spacing: -0.5px; }
    .order-status-badge { display: inline-block; background: #e8f5e9; color: #2e7d32; font-weight: 700; font-size: 0.82rem; padding: 4px 12px; border-radius: 50px; border: 1px solid #c8e6c9; margin-top: 6px; }
    .body-content { padding: 28px 24px; }
    .greeting { font-size: 1.2rem; font-weight: 700; color: #333; margin-bottom: 8px; }
    .intro-text { font-size: 0.93rem; color: #555; line-height: 1.6; margin-bottom: 20px; }
    .meta-box { background: #fff0f5; border-radius: 16px; padding: 18px; margin-bottom: 24px; font-size: 0.88rem; line-height: 1.7; border: 1px solid #fce4ec; }
    .meta-box strong { color: #d35d88; }
    .table-title { font-size: 1rem; font-weight: 700; color: #d35d88; margin-bottom: 10px; border-bottom: 2px solid #f47aab; padding-bottom: 6px; }
    .order-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .order-table th { background: #fff0f5; color: #d35d88; padding: 10px; text-align: left; font-size: 0.82rem; text-transform: uppercase; border-bottom: 2px solid #f47aab; }
    .summary-box { background: #ffffff; border-radius: 12px; border: 1px solid #fce4ec; padding: 14px 18px; margin-bottom: 24px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 0.88rem; color: #666; margin-bottom: 6px; }
    .total-row { display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: #d35d88; border-top: 1.5px dashed #f47aab; padding-top: 10px; margin-top: 6px; }
    .thankyou-card { background: #fff0f5; border: 1.5px dashed #f47aab; border-radius: 18px; padding: 22px; text-align: center; margin-bottom: 26px; }
    .thankyou-card h3 { margin: 0 0 8px 0; font-size: 1.35rem; color: #d35d88; font-weight: 800; }
    .thankyou-card p { margin: 4px 0; font-size: 0.9rem; color: #555; line-height: 1.5; }
    .btn-wrap { text-align: center; margin-bottom: 28px; }
    .btn-invoice { display: inline-block; background-color: #f47aab; color: #ffffff !important; padding: 14px 34px; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 1rem; box-shadow: 0 5px 20px rgba(244,122,171,0.4); }
    .support-box { background: #fafafa; border-radius: 14px; padding: 16px; font-size: 0.85rem; color: #666; text-align: center; line-height: 1.6; margin-bottom: 10px; }
    .footer { text-align: center; font-size: 0.8rem; color: #999; padding: 15px 20px 25px 20px; line-height: 1.5; }
    .footer a { color: #d35d88; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header-banner">
        <img src="${MASCOT_IMG_URL}" alt="Tabby Chaser Mascot" class="mascot-img" />
        <div class="brand-title">🐾 Tabby Chaser</div>
        <div class="order-status-badge">PAYMENT VERIFIED &amp; CONFIRMED ✅</div>
      </div>

      <div class="body-content">
        <div class="greeting">Hi ${name}, 💖</div>
        <div class="intro-text">
          Thank you for your order! Your payment has been successfully received and your order is confirmed. Every single charm is handcrafted with love by one sleepy cat, so please allow 4-5 weeks for sculpting, baking, and delivery! 🐾
        </div>

        <div class="meta-box">
          <strong>Order Reference:</strong> #${orderId}<br/>
          <strong>Date &amp; Time:</strong> ${createdDate}<br/>
          <strong>Payment Status:</strong> ${paymentMethod}<br/>
          <strong>Delivery Address:</strong> ${address}<br/>
          <strong>Contact Phone:</strong> ${phone || 'Provided at checkout'}
        </div>

        <div class="table-title">ORDER SUMMARY</div>
        <table class="order-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>₹${subtotal}</span>
          </div>
          ${discount > 0 ? `
          <div class="summary-row" style="color: #2e7d32;">
            <span>Discount:</span>
            <span>-₹${discount}</span>
          </div>` : ''}
          <div class="summary-row">
            <span>Shipping:</span>
            <span>${shipping === 0 ? 'FREE 🚚' : '₹' + shipping}</span>
          </div>
          <div class="total-row">
            <span>Total Amount Paid:</span>
            <span>₹${totalAmount}</span>
          </div>
        </div>

        <div class="thankyou-card">
          <h3>thank you! 💕</h3>
          <p>Thank you for supporting my small handmade business.</p>
          <p>Each order means the world to me.</p>
          <p style="font-weight: 700; color: #d35d88; margin-top: 10px; font-size: 0.95rem;">
            Happy shopping!<br/>- Tabby Chaser
          </p>
        </div>

        <div class="btn-wrap">
          <a href="${invoiceUrl}" target="_blank" class="btn-invoice">🧾 Download Invoice (PDF)</a>
        </div>

        <div class="support-box">
          <strong>Need Help or Have Questions?</strong><br/>
          Email us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#d35d88;">${SUPPORT_EMAIL}</a> or WhatsApp <a href="https://wa.me/917996545772" style="color:#d35d88;">${SUPPORT_PHONE}</a>.
        </div>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} ${STORE_NAME}. All rights reserved.<br/>
        <a href="${STORE_URL}">Visit Store</a> • <a href="${STORE_URL}/policies">Store Policies</a>
      </div>
    </div>
  </div>
</body>
</html>`;
    },

    // 2. Transactional Email Dispatcher with Idempotency & Fail-Safe Logging
    sendOrderConfirmation: async function (orderData) {
      if (!orderData) return { success: false, reason: 'No order data provided' };

      const orderId = orderData.order_reference || orderData.id || ('TC-' + Date.now());
      const custEmail = (orderData.email || '').trim();

      if (!custEmail) {
        console.warn(`[TabbyEmailService] No email address for order #${orderId}`);
        return { success: false, reason: 'No customer email' };
      }

      // Requirement 6: Idempotency Check - Never send twice for same order
      const idempotencyKey = `tabby_email_sent_${orderId}`;
      if (localStorage.getItem(idempotencyKey)) {
        console.log(`[TabbyEmailService] Email already sent for order #${orderId} (idempotency check passed)`);
        return { success: true, alreadySent: true };
      }

      try {
        if (window.fetchCloudSettings) {
          const settings = await window.fetchCloudSettings();
          if (settings && settings[idempotencyKey]) {
            console.log(`[TabbyEmailService] Cloud idempotency check: Email already sent for #${orderId}`);
            localStorage.setItem(idempotencyKey, 'true');
            return { success: true, alreadySent: true };
          }
        }
      } catch (e) {}

      const subject = `Order Confirmed! - #${orderId} | ${STORE_NAME}`;
      const htmlContent = this.generateOrderConfirmationHtml(orderData);

      const payload = {
        type: 'order_confirmation',
        orderId: orderId,
        to: custEmail,
        subject: subject,
        html: htmlContent,
        orderData: orderData
      };

      let sentSuccess = false;
      let logError = null;

      // Send to Vercel Resend Serverless Route (/api/send-email)
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();
        if (response.ok && resData.success) {
          sentSuccess = true;
          console.log(`✅ [TabbyEmailService] Resend email dispatched for order #${orderId}`, resData);
        } else {
          logError = resData.error || `HTTP ${response.status}`;
        }
      } catch (err) {
        logError = err.message || 'Network error';
      }

      // Requirement 5 & 6: Log status to Cloud Settings & mark Idempotency
      if (sentSuccess) {
        try {
          localStorage.setItem(idempotencyKey, 'true');
          if (window.saveCloudSetting) {
            await window.saveCloudSetting(idempotencyKey, 'true');
          }
        } catch (e) {}
      }

      try {
        if (window.saveCloudSetting) {
          await window.saveCloudSetting(`email_log_${orderId}`, {
            order_id: orderId,
            to: custEmail,
            subject: subject,
            status: sentSuccess ? 'sent' : 'failed',
            error: logError || null,
            provider: 'resend',
            sent_at: new Date().toISOString()
          });
        }
      } catch (e) {}

      return { success: sentSuccess, error: logError };
    }
  };

  window.TabbyEmailService = TabbyEmailService;
})();
