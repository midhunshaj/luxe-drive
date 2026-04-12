const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This middleware protects private routes
const protect = async (req, res, next) => {
  let token;

  // Check if Bearer token is in the header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      console.log("🔍 RAW AUTH HEADER: ", `[${req.headers.authorization}]`);
      try {
        token = req.headers.authorization.split(' ')[1];

      // DEBUG: Verify secret availability during request
      if (!process.env.JWT_SECRET) console.error("❌ AUTH FAILURE: JWT_SECRET is missing during verification!");
      else console.log("🔍 AUTH TRACE: Verification secret length: ", process.env.JWT_SECRET.length);

      // Decode token to get User ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object to the request (minus the password)
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error("❌ AUTH ERROR DETAIL: ", error.message);
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
  } else if (req.user && (req.user.role === 'provider' || req.user.role === 'taxi_driver') && req.user.providerStatus === 'approved') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized or account pending approval' });
  }
};

module.exports = { protect, admin };
