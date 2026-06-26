const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  category: {
    type: String,
    enum: ['Industry News','Buying Guide','Financing','Fleet Guide','Tips & Maintenance'],
    default: 'Industry News'
  },
  excerpt:     { type: String, required: true },
  content:     { type: String, required: true },
  coverImage:  { type: String, default: '' },
  author:      { type: String, default: 'Sabicars Team' },
  published:   { type: Boolean, default: false },
  publishedAt: { type: Date },
  readTime:    { type: String, default: '3 min read' },
  reactions: {
    like:       { type: Number, default: 0 },
    fire:       { type: Number, default: 0 },
    love:       { type: Number, default: 0 },
    insightful: { type: Number, default: 0 },
  },
  shares:      { type: Number, default: 0 },
  views:       { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', BlogPostSchema);
