const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const auth = require('../middleware/auth');

const GOLD = '#d4af37';

function buildEmail({ title, message, ctaText, ctaUrl, imageUrl, siteUrl }) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">

    <tr><td style="padding:26px 28px 18px;border-bottom:1px solid #2a2a2a;">
      <div style="font-size:22px;font-weight:700;color:${GOLD};letter-spacing:.5px;">Sabicars</div>
      <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-top:2px;">Luxury Auto · Lagos</div>
    </td></tr>

    ${imageUrl ? `<tr><td><img src="${imageUrl}" alt="" style="width:100%;display:block;"/></td></tr>` : ''}

    <tr><td style="padding:30px 28px;">
      <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;color:#eee;font-weight:700;">${title}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#aaa;font-weight:300;">${message.replace(/\n/g,'<br/>')}</p>
      ${ctaUrl ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${GOLD};border-radius:6px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:13px 30px;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#000;text-decoration:none;">${ctaText || 'View Now'}</a>
      </td></tr></table>` : ''}
    </td></tr>

    <tr><td style="padding:20px 28px;border-top:1px solid #2a2a2a;background:#141414;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;line-height:1.6;">
        📞 <a href="tel:+2348101885558" style="color:${GOLD};text-decoration:none;">0810 188 5558</a> &nbsp;·&nbsp;
        💬 <a href="https://wa.me/2348055065825" style="color:${GOLD};text-decoration:none;">WhatsApp</a>
      </p>
      <p style="margin:0;font-size:11px;color:#666;line-height:1.6;">
        Amazing Grace Plaza, Km 13 Lasu Road, Igando, Lagos · RC 1560100<br/>
        <a href="${siteUrl}" style="color:#666;">Visit site</a> · You're receiving this because you subscribed to Sabicars updates.
      </p>
    </td></tr>

  </table>
</td></tr></table>
</body></html>`;
}

router.post('/send', auth, async (req, res) => {
  try {
    const { title, message, ctaText, ctaUrl, imageUrl } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message required' });
    }
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
      return res.status(500).json({ success: false, message: 'Resend keys not set in Render environment variables' });
    }

    const subs = await Subscriber.find({ active: true }).select('email');
    if (!subs.length) {
      return res.status(400).json({ success: false, message: 'No active subscribers to email' });
    }

    const siteUrl = process.env.SITE_URL || 'https://alexxxj.github.io/sabicars-limited';
    const html = buildEmail({ title, message, ctaText, ctaUrl, imageUrl, siteUrl });
    const from = `${process.env.RESEND_FROM_NAME || 'Sabicars Limited'} <${process.env.RESEND_FROM_EMAIL}>`;

    // Resend batch endpoint accepts max 100 per call
    const emails = subs.map(s => ({ from, to: [s.email], subject: title, html }));
    const chunks = [];
    for (let i = 0; i < emails.length; i += 100) chunks.push(emails.slice(i, i + 100));

    let sent = 0;
    const errors = [];

    for (const chunk of chunks) {
      const r = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(chunk)
      });
      const data = await r.json();
      if (r.ok && data.data) sent += data.data.length;
      else errors.push(data.message || JSON.stringify(data));
    }

    if (sent === 0) {
      return res.status(400).json({ success: false, message: errors[0] || 'Send failed' });
    }
    res.json({ success: true, sent, total: subs.length, errors: errors.length ? errors : undefined });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;