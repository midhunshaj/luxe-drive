const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables dynamically perfectly bypassing PM2's current-working-directory bug
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

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

  socket.on('lockCar', ({ carId, userId }) => {
    if (!activeLocks[carId]) activeLocks[carId] = [];
    if (!activeLocks[carId].includes(userId)) {
      activeLocks[carId].push(userId);
    }
    io.emit('carLocked', { carId, userIds: activeLocks[carId] });
    console.log(`🔒 Car LOCKED: ${carId} (Active users: ${activeLocks[carId].length})`);
  });

  socket.on('unlockCar', ({ carId, userId }) => {
    if (activeLocks[carId]) {
      activeLocks[carId] = activeLocks[carId].filter(id => id !== userId);
      if (activeLocks[carId].length === 0) delete activeLocks[carId];
    }
    io.emit('carUnlocked', { carId, userIds: activeLocks[carId] || [] });
    console.log(`🔓 Car UNLOCKED: ${carId}`);
  });

  socket.on('disconnect', () => {
    console.log('📡 User disconnected');
  });
});

// Configure the live Production/Dev Port
const PORT = process.env.PORT || 5000;

// Activate Server
server.listen(PORT, () => {
  console.log(`🚀 LuxeDrive Server natively running with Socket.io in [${process.env.NODE_ENV}] mode on port ${PORT}`);
});
