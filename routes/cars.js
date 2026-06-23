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

// POST — features excluded, saved separately via PATCH
router.post('/', auth, handleUpload, async (req, res) => {
  try {
    const images = req.files ? req.files.map(f => f.path) : [];
    const body = { ...req.body };
    delete body.features;
    delete body.featuresCSV;
    delete body.featuresJSON;
    const car = await Car.create({ ...body, images, features: [] });
    res.status(201).json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT — features deliberately not touched here
router.put('/:id', auth, handleUpload, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });

    if (req.body.imagesManaged === 'true') {
      const keptImages = Array.isArray(req.body.keepImages)
        ? req.body.keepImages
        : (req.body.keepImages ? [req.body.keepImages] : []);
      const newImages = req.files ? req.files.map(f => f.path) : [];
      car.images = [...keptImages, ...newImages];
      car.markModified('images');
    } else if (req.files && req.files.length > 0) {
      car.images = req.files.map(f => f.path);
      car.markModified('images');
    }

    const stringFields = [
      'make','model','year','category','condition','bodyType',
      'mileage','fuel','colour','price','tag','description',
      'engine','horsepower','transmission','drivetrain',
      'interiorColor','seats'
    ];
    stringFields.forEach(field => {
      if (req.body[field] !== undefined) car[field] = req.body[field];
    });

    if (req.body.available !== undefined) {
      car.available = req.body.available === 'true' || req.body.available === true;
    }

    await car.save();
    res.json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH features — pure JSON, zero multer involvement
router.patch('/:id/features', auth, express.json(), async (req, res) => {
  try {
    const features = Array.isArray(req.body.features) ? req.body.features : [];
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    car.features = features;
    car.markModified('features');
    await car.save();
    res.json({ success: true, features: car.features });
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
