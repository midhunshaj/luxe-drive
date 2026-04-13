const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  car: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Car' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalCost: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  dealerStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  deliveryLocation: { type: String },
  licenseNo: { type: String },
  phoneNo: { type: String },
  promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  discountAmount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
