const express = require('express');
const router = express.Router();
const SiteSettings = require('../models/SiteSettings');
const auth = require('../middleware/auth');

router.get('/:key', async (req, res) => {
  try {
    const setting = await SiteSettings.findOne({ key: req.params.key });
    res.json({ success: true, value: setting ? setting.value : '' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:key', auth, async (req, res) => {
  try {
    const setting = await SiteSettings.findOneAndUpdate(
      { key: req.params.key },
      { value: req.body.value || '' },
      { new: true, upsert: true }
    );
    res.json({ success: true, setting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;