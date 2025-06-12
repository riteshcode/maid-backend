const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
