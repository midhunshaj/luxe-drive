const express = require('express');
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

console.log('🔍 Boot Check: Google Auth ID present?', !!process.env.GOOGLE_CLIENT_ID);

if (!process.env.GOOGLE_CLIENT_ID) console.warn("🚨 Warning: GOOGLE_CLIENT_ID is missing in .env. Social login will fail.");

// --- CRASH PREVENTION: Global Error Listeners ---
process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL: Uncaught Exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ UNHANDLED REJECTION:', reason);
});

const Car = require('./models/Car'); // Require models at top level for stability

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- IN-MEMORY LOCK SYSTEM ---
// Tracks arrays of userIds currently "checking out" each carId
const activeLocks = {}; 

// Socket.io Real-time Logic
io.on('connection', (socket) => {
  console.log('📡 Logic Engine: New User Socket Connection established:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User joined private room: ${userId}`);
    socket.emit('initialLocks', activeLocks);
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

  socket.on('disconnect', () => {
    // Clean up all locks held by this socket on disconnect
    Object.keys(activeLocks).forEach(carId => {
      activeLocks[carId] = activeLocks[carId].filter(l => l.socketId !== socket.id);
      if (activeLocks[carId].length === 0) delete activeLocks[carId];
      io.emit('carUnlocked', { carId, locks: activeLocks[carId] || [] });
    });
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
