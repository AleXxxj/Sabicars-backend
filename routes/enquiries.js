const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');
const auth = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message required' });
    const enquiry = await Enquiry.create({ name, email, phone, subject, message });
    res.status(201).json({ success: true, enquiry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/admin/all', auth, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/read', auth, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
