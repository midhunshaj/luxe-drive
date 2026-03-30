const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  // Signs a JWT with the user's ID, expiring in 30 days
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
