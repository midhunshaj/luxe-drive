const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  availabilityStatus: { type: String, enum: ['available', 'rented', 'maintenance'], default: 'available' },
  countInStock: { type: Number, required: true, default: 1 },
  dealerName: { type: String, default: 'LuxeDrive Premium' },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // GeoJSON data structure for Map Integration
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // format: [longitude, latitude]
  },
  images: [{ type: String }],
  blockedDates: [{ type: String }],
  features: [{ type: String }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    comment: { type: String }
  }],
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Creates a geospatial index so we can query cars "near" a user's map location
carSchema.index({ location: '2dsphere' });

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
