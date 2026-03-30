const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables dynamically
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- SECURE MIDDLEWARES ---
// NO HELMET! We forcefully removed Helmet to destroy the CSP Firewall that was blocking Razorpay downloads on the Linux Server!
app.use(cors());

// Body parser to accept massive JSON data payloads in the request body
app.use(express.json());

// Console Logger (Forces Linux to print every single API hit so we can see NGINX network data)
app.use(morgan('dev'));

// Setup Route Folders
const authRoutes = require('./routes/authRoutes');

// Basic Health-check ping
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'LuxeDrive API is natively unblocked and running flawlessly.' });
});

// Boot Main API Endpoints
app.use('/api/users', authRoutes);
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Configure the live Production/Dev Port
const PORT = process.env.PORT || 5000;

// Activate Server
app.listen(PORT, () => {
  console.log(`🚀 LuxeDrive Server natively running in [${process.env.NODE_ENV}] mode on port ${PORT}`);
});
