const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Secondary PIN verification for admin actions
router.post('/verify-pin', async (req, res) => {
  try {
    const { pin, type } = req.body;
    if (!pin) return res.status(400).json({ success: false, message: 'PIN is required' });
    const validPin = type === 'blog' ? process.env.BLOG_PIN : process.env.INVENTORY_PIN;
    if (!validPin) {
      const varName = type === 'blog' ? 'BLOG_PIN' : 'INVENTORY_PIN';
      return res.status(500).json({ success: false, message: `${varName} not set on server. Add it to your Render environment variables.` });
    }
    if (pin === validPin) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect PIN. Try again.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
