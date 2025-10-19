require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// allow your React client origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const uploadsPath = path.join(__dirname, 'uploads');

app.use('/uploads', (req, res, next) => {
  // Allow cross origin embedding of these static images
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(uploadsPath));

// routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
