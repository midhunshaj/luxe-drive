const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ 
      name, email, password, 
      role: role && ['user', 'provider'].includes(role) ? role : 'user', 
      companyName,
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
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    // Validate email AND check hashed password using our model middleware
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
// @route   GET /api/users/profile
// @access  Private
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
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      
      // Update KYC Details
      user.kycDetails = {
        licenseFront: req.body.licenseFront || user.kycDetails?.licenseFront,
        licenseBack: req.body.licenseBack || user.kycDetails?.licenseBack,
        idProofFront: req.body.idProofFront || user.kycDetails?.idProofFront,
        idProofBack: req.body.idProofBack || user.kycDetails?.idProofBack
      };

      // Auto-transition status if docs are complete
      if (user.kycDetails.licenseFront && user.kycDetails.licenseBack && 
          user.kycDetails.idProofFront && user.kycDetails.idProofBack && 
          user.kycStatus === 'pending') {
        user.kycStatus = 'submitted';
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        kycStatus: updatedUser.kycStatus,
        kycDetails: updatedUser.kycDetails,
        role: updatedUser.role,
        providerStatus: updatedUser.providerStatus,
        companyName: updatedUser.companyName,
        wishlist: updatedUser.wishlist,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Car in Wishlist
// @route   POST /api/users/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const { carId } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      const index = user.wishlist.indexOf(carId);
      if (index === -1) {
        user.wishlist.push(carId); // Add to wishlist
      } else {
        user.wishlist.splice(index, 1); // Remove from wishlist
      }
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
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const providers = await User.find({ role: 'provider' }).select('-password');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProviderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (user) {
      user.providerStatus = req.body.status;
      await User.findByIdAndUpdate(req.params.id, { providerStatus: req.body.status });
      res.json({ message: 'Provider status updated', providerStatus: req.body.status });
    } else {
      res.status(404).json({ message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all KYC requests
// @route   GET /api/users/kyc-requests
// @access  Private/Admin
const getKycRequests = async (req, res) => {
  try {
    const users = await User.find({ kycStatus: { $ne: 'pending' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update User KYC Status
// @route   PUT /api/users/:id/kyc-status
// @access  Private/Admin
const updateKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.kycStatus = req.body.status || user.kycStatus;
      await user.save();
      res.json({ message: 'KYC status updated' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, authUser, getUserProfile, updateUserProfile, toggleWishlist, getProviders, updateProviderStatus, getKycRequests, updateKycStatus };
