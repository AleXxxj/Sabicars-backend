const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, count: notifications.length, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, message, type, link, icon } = req.body;
    if (!title || !message) return res.status(400).json({ success: false, message: 'Title and message required' });
    const notification = await Notification.create({ title, message, type: type || 'system', link: link || '', icon: icon || '' });
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
