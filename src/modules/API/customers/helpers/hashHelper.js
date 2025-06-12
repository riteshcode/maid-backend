// helpers/hashHelper.js
const bcrypt = require('bcrypt');

module.exports = {
  hashPassword: async function(password) {
    return await bcrypt.hash(password, 10);
  },
  comparePassword: async function(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
};
