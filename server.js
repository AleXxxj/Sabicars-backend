const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const carsRouter          = require('./routes/cars');
const authRouter          = require('./routes/auth');
const blogRouter          = require('./routes/blog');
const reviewsRouter       = require('./routes/reviews');
const settingsRouter      = require('./routes/settings');
const subscribersRouter   = require('./routes/subscribers');
const notificationsRouter = require('./routes/notifications');
const enquiriesRouter     = require('./routes/enquiries');

app.use('/api/cars',          carsRouter);
app.use('/api/auth',          authRouter);
app.use('/api/blog',          blogRouter);
app.use('/api/reviews',       reviewsRouter);
app.use('/api/settings',      settingsRouter);
app.use('/api/subscribers',   subscribersRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/enquiries',     enquiriesRouter);

app.get('/', (req, res) => {
  res.json({ message: '🚗 Sabicars API is running!', routes: ['/api/cars','/api/auth','/api/blog','/api/reviews','/api/settings','/api/subscribers','/api/notifications','/api/enquiries'] });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
