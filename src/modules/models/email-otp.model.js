

const mongoose = require("mongoose");

const emailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 60 * 1000), 		
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
