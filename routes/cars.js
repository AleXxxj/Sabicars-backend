const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middleware/auth');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sabicars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage });

// GET all cars for ADMIN (includes unavailable/sold cars)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json({ success: true, count: cars.length, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all cars (public — anyone can view)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    let filter = { available: true };
    if (category) filter.category = category;
    if (featured) filter.featured = true;
    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: cars.length, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single car (public)
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add new car (ADMIN ONLY)
router.post('/', auth, upload.array('images', 6), async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => f.path) : [];
    const car = await Car.create({ ...req.body, images });
    res.status(201).json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update car (ADMIN ONLY)
router.put('/:id', auth, upload.array('images', 6), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(f => f.path);
    }
    const car = await Car.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE car (ADMIN ONLY)
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
