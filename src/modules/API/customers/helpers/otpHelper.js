const User = require("../../../models/user.model"); // Make sure this path is correct
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minute (you can change this to 5 * 60 * 1000 for 5 minutes)
const otpStore = {}; // In-memory storage for OTPs

module.exports = {
  generateOtp: async function(phone) {
    try {
      // Check if user exists with the provided phone number
      const user = await User.findOne({ phone });

      if (!user) {
        console.log(`User with phone number ${phone} is not registered.`);
        return { error: 'Phone number is not registered.' };
      }

      // If user exists, generate OTP
      var otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[phone] = { otp: otp, expiresAt: Date.now() + OTP_EXPIRY };
      
      console.log(`Generated OTP for ${phone}: ${otp}`);  
      console.log(`OTP store: ${JSON.stringify(otpStore)}`); 

      // Automatically remove OTP from store after expiry
      setTimeout(() => {
        if (otpStore[phone] && Date.now() >= otpStore[phone].expiresAt) {
          delete otpStore[phone]; // Remove OTP from store only
          console.log(`OTP for phone ${phone} has expired and is removed from OTP store.`);
        }
      }, OTP_EXPIRY);

      return { otp }; // Return OTP if generated successfully
    } catch (error) {
      console.error('Error generating OTP:', error);
      return { error: 'An error occurred while generating OTP.' };
    }
  },

  verifyOtp: function(phone, enteredOtp) {
    console.log(`Verifying OTP for phone ${phone} with entered OTP: ${enteredOtp}`);  

    var record = otpStore[phone];
    if (!record) {
      console.log('No OTP record found for this phone.');  
      return false;
    }

    var isOtpValid = record.otp === enteredOtp && Date.now() < record.expiresAt;

    if (isOtpValid) {
      console.log('OTP is valid.');  
      delete otpStore[phone]; // Remove OTP after successful verification
    } else {
      console.log('OTP is invalid or expired.');  
    }

    return isOtpValid;
  }
};
