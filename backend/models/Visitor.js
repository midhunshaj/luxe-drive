const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ip: { type: String },
  location: {
    city: String,
    country: String,
    region: String,
    coordinates: [Number] // [lat, lng]
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number, default: 0 }, // In seconds
  pageVisits: [{ 
    path: String, 
    timestamp: { type: Date, default: Date.now } 
  }],
}, { timestamps: true });

module.exports = mongoose.model('Visitor', visitorSchema);
