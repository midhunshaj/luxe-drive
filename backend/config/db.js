const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempting to connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected securely: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // DO NOT process.exit yet so we can test the routes even before the DB is hooked up
  }
};

module.exports = connectDB;
