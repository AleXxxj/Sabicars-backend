const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const auth = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'sabicars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  },
});

const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

function handleUpload(req, res, next) {
  upload.array('images', 12)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_COUNT')
          return res.status(400).json({ success: false, message: 'Too many images. Maximum 12 photos per vehicle.' });
        if (err.code === 'LIMIT_FILE_SIZE')
          return res.status(400).json({ success: false, message: 'A photo is too large. Max 20MB per image.' });
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(500).json({ success: false, message: `Upload failed: ${err.message}` });
    }
    next();
  });
}

function parseFeatures(body) {
  if (body.featuresJSON) {
    try {
      const parsed = JSON.parse(body.featuresJSON);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }
  if (body.features) {
    return Array.isArray(body.features) ? body.features : [body.features];
  }
  return [];
}

router.get('/admin/all', auth, async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json({ success: true, count: cars.length, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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

router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', auth, handleUpload, async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => f.path) : [];
    const body = { ...req.body };
    body.features = parseFeatures(body);
    delete body.featuresJSON;
    const car = await Car.create({ ...body, images });
    res.status(201).json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', auth, handleUpload, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.body.imagesManaged === 'true') {
      const keptImages = Array.isArray(req.body.keepImages)
        ? req.body.keepImages
        : (req.body.keepImages ? [req.body.keepImages] : []);
      const newImages = req.files ? req.files.map(f => f.path) : [];
      updates.images = [...keptImages, ...newImages];
      delete updates.imagesManaged;
      delete updates.keepImages;
    } else if (req.files && req.files.length > 0) {
      updates.images = req.files.map(f => f.path);
    }

    updates.features = parseFeatures(updates);
    delete updates.featuresJSON;

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: false }
    );
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

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
