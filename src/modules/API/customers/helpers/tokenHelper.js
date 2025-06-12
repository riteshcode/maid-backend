// helpers/tokenHelper.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';

module.exports = {
  generateToken: function(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  },
  verifyToken: function(token) {
    return jwt.verify(token, SECRET_KEY);
  }
};
