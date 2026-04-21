const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

const envPath1 = path.join(__dirname, '.env');
const envPath2 = path.join(__dirname, '../.env');
console.log(`📡 Searching for config in: \n 1. ${envPath1} \n 2. ${envPath2}`);
dotenv.config({ path: envPath1 });
dotenv.config({ path: envPath2 });

// Connect to MongoDB
connectDB();

if (process.env.JWT_SECRET) process.env.JWT_SECRET = process.env.JWT_SECRET.trim();
if (process.env.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID.trim();

console.log('🔍 Boot Check: Google Auth ID present?', !!process.env.GOOGLE_CLIENT_ID);
console.log('🔍 Boot Check: JWT Secret Active? ', !!process.env.JWT_SECRET, `| Value: [${process.env.JWT_SECRET}] | (Char length: ${process.env.JWT_SECRET?.length})`);

if (!process.env.GOOGLE_CLIENT_ID) console.warn("🚨 Warning: GOOGLE_CLIENT_ID is missing in .env. Social login will fail.");

// --- CRASH PREVENTION: Global Error Listeners ---
process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL: Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ UNHANDLED REJECTION:', reason);
});

const Car = require('./models/Car');
const Visitor = require('./models/Visitor');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your domain in production for extra security
    methods: ["GET", "POST"]
  }
});

// Attach io to app to access it in controllers
app.set('io', io);

// --- SECURE MIDDLEWARES ---
app.use(cors());
app.use(express.json());
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
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- IN-MEMORY LOCK SYSTEM ---
// Tracks arrays of userIds currently "checking out" each carId
const activeLocks = {}; 

// Socket.io Real-time Logic
io.on('connection', (socket) => {
  console.log('📡 Logic Engine: New User Socket Connection established:', socket.id);

  // Track new visitor
  const createVisitor = async () => {
    try {
      // Get real IP (handling proxies like Render/Heroku/Nginx)
      let ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
      if (ip.includes(',')) ip = ip.split(',')[0].trim(); // Handle multiple IPs in header
      if (ip === '::1' || ip === '::ffff:127.0.0.1') ip = '8.8.8.8'; // Mock IP for local testing

      let locationData = {};
      try {
        const { data } = await axios.get(`http://ip-api.com/json/${ip}`);
        if (data.status === 'success') {
          locationData = {
            city: data.city,
            country: data.country,
            region: data.regionName,
            coordinates: [data.lat, data.lon]
          };
        }
      } catch (err) {
        console.error('Geo-fetch failed:', err.message);
      }

      await Visitor.create({ 
        socketId: socket.id,
        ip: ip === '8.8.8.8' ? '127.0.0.1 (Local)' : ip,
        location: locationData,
        startTime: new Date()
      });
      io.emit('visitorUpdate'); // Notify admin to refresh
    } catch (err) {
      console.error('Error creating visitor:', err);
    }
  };
  createVisitor();

  socket.on('join', async (userId) => {
    socket.join(userId);
    console.log(`👤 User joined private room: ${userId}`);
    socket.emit('initialLocks', activeLocks);
    
    // Associate visitor with user ID
    try {
      await Visitor.findOneAndUpdate({ socketId: socket.id }, { userId });
    } catch (err) {
      console.error('Error updating visitor with userId:', err);
    }
  });

  socket.on('lockCar', async ({ carId, userId }) => {
    try {
      const car = await Car.findById(carId);
      if (!car) {
        socket.emit('lockRejected', { carId, reason: 'Vehicle data not found.' });
        return;
      }

      if (!activeLocks[carId]) activeLocks[carId] = [];
      
      // RACING PREVENTION: Check if there is space for another lock right now
      const currentOccupancy = activeLocks[carId].filter(l => l.socketId !== socket.id).length;
      if (currentOccupancy >= car.countInStock) {
         socket.emit('lockRejected', { carId, reason: 'This vehicle was just reserved by someone else.' });
         return;
      }

      const lockExists = activeLocks[carId].find(l => l.socketId === socket.id);
      if (!lockExists) {
        activeLocks[carId].push({ socketId: socket.id, userId });
      }
      io.emit('carLocked', { carId, locks: activeLocks[carId] });
      socket.emit('lockGranted', { carId }); 
      console.log(`🔒 Car LOCK GRANTED: ${carId} (Occupancy: ${activeLocks[carId].length}/${car.countInStock})`);
    } catch (err) {
      console.error("Locking logic failed:", err);
      socket.emit('lockRejected', { carId, reason: 'Internal Server Error while locking.' });
    }
  });

  socket.on('unlockCar', ({ carId }) => {
    if (activeLocks[carId]) {
      activeLocks[carId] = activeLocks[carId].filter(l => l.socketId !== socket.id);
      if (activeLocks[carId].length === 0) delete activeLocks[carId];
    }
    io.emit('carUnlocked', { carId, locks: activeLocks[carId] || [] });
    console.log(`🔓 Car UNLOCKED: ${carId}`);
  });

  socket.on('disconnect', async () => {
    // Clean up all locks held by this socket on disconnect
    Object.keys(activeLocks).forEach(carId => {
      activeLocks[carId] = activeLocks[carId].filter(l => l.socketId !== socket.id);
      if (activeLocks[carId].length === 0) delete activeLocks[carId];
      io.emit('carUnlocked', { carId, locks: activeLocks[carId] || [] });
    });

    // Update visitor duration
    try {
      const visitor = await Visitor.findOne({ socketId: socket.id });
      if (visitor) {
        const endTime = new Date();
        const duration = Math.floor((endTime - visitor.startTime) / 1000);
        visitor.endTime = endTime;
        visitor.duration = duration;
        await visitor.save();
      }
      io.emit('visitorUpdate');
    } catch (err) {
      console.error('Error updating visitor disconnect:', err);
    }

    console.log('📡 User disconnected and locks cleared');
  });
});

// --- GLOBAL ERROR HANDLER ---
// Captures any errors thrown in routes and logs them for PM2 debugging
app.use((err, req, res, next) => {
  console.error("❌ SERVER LOGIC ERROR:", err.stack);
  res.status(500).json({ 
    message: err.message, 
    stack: process.env.NODE_ENV === 'production' ? '🛡️ Protected' : err.stack 
  });
});

// Configure the live Production/Dev Port
const PORT = process.env.PORT || 5000;

// Activate Server
server.listen(PORT, () => {
  console.log(`🚀 LuxeDrive Server natively running with Socket.io in [${process.env.NODE_ENV}] mode on port ${PORT}`);
});
