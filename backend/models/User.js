const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
  companyName: { type: String }, // New field specifically for rental providers
  providerStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  isVerified: { type: Boolean, default: false },
  phone: { type: String },
  address: { type: String },
  driverLicenseUrl: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }]
}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

// Pre-save middleware to hash the password securely before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to verify passwords securely during login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
