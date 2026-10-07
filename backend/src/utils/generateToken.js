const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token containing the user ID
 * @param {string} id - The MongoDB User ID
 * @returns {string} Signed JWT token
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'bioweave_secret_fallback_key';
  return jwt.sign({ id }, secret, {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
