const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const auth = require('../middleware/auth');

// GET all published posts (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    let filter = { published: true };
    if (category && category !== 'all') filter.category = category;
    const posts = await BlogPost.find(filter)
      .sort({ publishedAt: -1 })
      .limit(Number(limit))
      .select('-content');
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all posts for admin including drafts (must be before /:slug)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 }).select('-content');
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single post by ID for admin editing (full content included)
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single post by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create post
router.post('/', auth, async (req, res) => {
  try {
    const body = { ...req.body };
    body.published = body.published === true || body.published === 'true';
    if (body.published) body.publishedAt = new Date();
    const post = await BlogPost.create(body);
    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update post
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = { ...req.body };
    updates.published = updates.published === true || updates.published === 'true';
    if (updates.published) {
      const existing = await BlogPost.findById(req.params.id);
      if (existing && !existing.published) updates.publishedAt = new Date();
    }
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;