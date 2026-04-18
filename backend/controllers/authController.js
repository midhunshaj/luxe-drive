const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');

// Helper to get Google Client securely
const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error("CRITICAL: GOOGLE_CLIENT_ID missing in backend .env");
    return null;
  }
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: 'User already exists with this mobile number' });
      }
    }

    const user = await User.create({ 
      name, email, password, 
      role: role && ['user', 'provider'].includes(role) ? role : 'user', 
      companyName,
      phone,
      providerStatus: role === 'provider' ? 'pending' : 'none'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        providerStatus: user.providerStatus,
        kycStatus: user.kycStatus,
        kycDetails: user.kycDetails,
        phone: user.phone,
        address: user.address,
        wishlist: user.wishlist,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login)
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        providerStatus: user.providerStatus,
        kycStatus: user.kycStatus,
        kycDetails: user.kycDetails,
        phone: user.phone,
        address: user.address,
        wishlist: user.wishlist,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile (Dashboard view)
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
        kycDetails: user.kycDetails,
        phone: user.phone,
        address: user.address,
        providerStatus: user.providerStatus,
        companyName: user.companyName,
        wishlist: user.wishlist,
        token: generateToken(user._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      
      const kyc = {
        licenseFront: req.body.licenseFront || (user.kycDetails ? user.kycDetails.licenseFront : ''),
        licenseBack: req.body.licenseBack || (user.kycDetails ? user.kycDetails.licenseBack : ''),
        idProofFront: req.body.idProofFront || (user.kycDetails ? user.kycDetails.idProofFront : ''),
        idProofBack: req.body.idProofBack || (user.kycDetails ? user.kycDetails.idProofBack : '')
      };
      
      user.kycDetails = kyc;

      if (kyc.licenseFront && kyc.licenseBack && kyc.idProofFront && kyc.idProofBack) {
        if (user.kycStatus === 'pending') {
          user.kycStatus = 'submitted';
        }
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Toggle Car in Wishlist
const toggleWishlist = async (req, res) => {
  try {
    const { carId } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      const index = user.wishlist.indexOf(carId);
      if (index === -1) user.wishlist.push(carId);
      else user.wishlist.splice(index, 1);
      await user.save();
      res.json(user.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProviders = async (req, res) => {
  const providers = await User.find({ role: 'provider' }).select('-password');
  res.json(providers);
};

const updateProviderStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.providerStatus = req.body.status;
    await user.save();
    res.json({ message: 'Provider status updated' });
  } else {
    res.status(404).json({ message: 'Provider not found' });
  }
};

const getKycRequests = async (req, res) => {
  const users = await User.find({ kycStatus: { $ne: 'pending' } }).select('-password');
  res.json(users);
};

const updateKycStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.kycStatus = req.body.status;
    await user.save();
    res.json({ message: 'KYC status updated' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  const client = getGoogleClient();
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, name } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, email, password: crypto.randomBytes(16).toString('hex'), role: 'user' });
    res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google Token' });
  }
};

// @desc    Send OTP via Fast2SMS
const sendOtp = async (req, res) => {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Normalize: Take only last 10 digits to avoid +91 or 0 prefix issues
    phone = phone.replace(/\D/g, '').slice(-10);

    const userExists = await User.findOne({ phone: new RegExp(phone + '$') });
    if (userExists) return res.status(400).json({ message: 'This mobile number is already registered.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndDelete({ phone });
    await Otp.create({ phone, code });

    // 📱 NEW: SMS GATE APP INTEGRATION (Using your mobile's 300 SMS/day quota)
    if (process.env.SMS_GATE_USERNAME && process.env.SMS_GATE_USERNAME !== 'UR_GET_FROM_APP_HOME') {
      try {
        const url = 'https://api.sms-gate.app/3rdparty/v1/message';
        const auth = Buffer.from(`${process.env.SMS_GATE_USERNAME}:${process.env.SMS_GATE_PASSWORD}`).toString('base64');
        
        const response = await axios.post(url, {
          message: `Your LuxeDrive OTP is ${code}. Verify to enter the fleet.`,
          phoneNumbers: [phone.startsWith('+91') ? phone : `+91${phone}`]
        }, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`📡 SMS-Gate Response (Mobile Gateway):`, response.data);
      } catch (apiErr) {
        console.error("❌ SMS-Gate API FAILURE:", apiErr.response?.data || apiErr.message);
        console.log(`💡 TESTER TIP: Use this code to continue testing: ${code}`);
        return res.json({ message: 'OTP generated (Mobile Gateway failed/Simulation)', simulation: true });
      }
    } else {
      console.log(`\n📱 [SIMULATION MODE]`);
      console.log(`NO SMS_GATE CREDENTIALS FOUND - USE THIS CODE: ${code}`);
      console.log(`-----------------------------------\n`);
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
const verifyOtp = async (req, res) => {
  try {
    let { phone, code } = req.body;
    phone = phone.replace(/\D/g, '').slice(-10);
    
    const otpRecord = await Otp.findOne({ phone, code });
    if (otpRecord) {
      await Otp.deleteOne({ _id: otpRecord._id });
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, getUserProfile, updateUserProfile, toggleWishlist, getProviders, updateProviderStatus, getKycRequests, updateKycStatus, googleLogin, sendOtp, verifyOtp };
