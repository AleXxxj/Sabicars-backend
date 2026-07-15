const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/send', auth, async (req, res) => {
  try {
    const { title, message, url } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });
    if (!process.env.ONESIGNAL_REST_API_KEY || !process.env.ONESIGNAL_APP_ID) {
      return res.status(500).json({ success: false, message: 'OneSignal keys not set in Render environment variables' });
    }

    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ['Total Subscriptions'],
      headings: { en: title },
      contents: { en: message },
    };
    if (url) payload.url = url;

    const r = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const data = await r.json();

    if (data.errors) return res.status(400).json({ success: false, message: JSON.stringify(data.errors) });
    res.json({ success: true, recipients: data.recipients || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
