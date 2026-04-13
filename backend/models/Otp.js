const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } } // Automatically delete after 5 minutes
});

module.exports = mongoose.model('Otp', otpSchema);
