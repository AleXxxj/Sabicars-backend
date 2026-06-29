const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const Comment = require('../models/comment');
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

// GET all posts for admin (must be before /:slug)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 }).select('-content');
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all comments for admin moderation
router.get('/comments/all', auth, async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 }).populate('postId', 'title slug');
    res.json({ success: true, count: comments.length, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single post by ID for admin editing
router.get('/admin/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single post by slug — increments views
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug, published: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET comments for a post
router.get('/:slug/comments', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const comments = await Comment.find({ postId: post._id, approved: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: comments.length, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add comment
router.post('/:slug/comments', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const { name, message } = req.body;
    if (!name || !message) return res.status(400).json({ success: false, message: 'Name and message are required' });
    const comment = await Comment.create({ postId: post._id, name: name.trim(), message: message.trim() });
    res.status(201).json({ success: true, comment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH react to post
router.patch('/:id/react', async (req, res) => {
  try {
    const { reaction } = req.body;
    const allowed = ['like', 'fire', 'love', 'insightful'];
    if (!allowed.includes(reaction)) return res.status(400).json({ success: false, message: 'Invalid reaction' });
    const inc = {};
    inc[`reactions.${reaction}`] = 1;
    const post = await BlogPost.findByIdAndUpdate(req.params.id, { $inc: inc }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, reactions: post.reactions });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH increment share count
router.patch('/:id/share', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, shares: post.shares });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
    const post = await BlogPost.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE post + its comments
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    await Comment.deleteMany({ postId: req.params.id });
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE single comment (admin)
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
