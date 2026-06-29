const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, location, rating, message } = req.body;
    if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message required' });
    const review = await Review.create({ name, location, rating: Number(rating) || 5, message });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/admin/all', auth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: req.body.approved }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
