const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This middleware protects private routes
const protect = async (req, res, next) => {
  let token;

  // Check if Bearer token is in the header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token to get User ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object to the request (minus the password)
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// This middleware restricts access to business operations (Admins & Approved Providers)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else if (req.user && req.user.role === 'provider' && req.user.providerStatus === 'approved') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized or account pending approval' });
  }
};

module.exports = { protect, admin };
