const jwt = require('jsonwebtoken');
const User = require('../../models/cleaners.model'); // Adjust the path based on your project structure

// In-memory token blacklist
const blacklistedTokens = new Set();
const addTokenToBlacklist = (token) => {
  blacklistedTokens.add(token);
};
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};
// Unified middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ success: false, message: 'Token already used or invalid' });
    }

    const decoded = jwt.verify(token, process.env.JWT_CLEANER_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ success: false, message: 'User not found or inactive' });
    }else if (user.status === 'Inactive'){
      return res.status(403).json({ success: false, message: 'User inactive ! please contact to Admin' });
    }

    req.user = user;
    req.token = token;
    req.addTokenToBlacklist = addTokenToBlacklist;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(500).json({ success: false, message: 'Authentication failed', error: err.message });
  }
};

module.exports = authMiddleware;
