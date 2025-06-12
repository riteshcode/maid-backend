const OTP = require('../../../models/otp.model');
const EmailOtp =require('../../../models/email-otp.model')
const otpGenerator = require('otp-generator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Helper {
  //  Generate OTP (6-digit numeric only)
  static async generateOtp(userId) {
    try {
      let otp;
      do {
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets: false, specialChars: false
        });
      } while (isNaN(otp));
      console.log(` Generated OTP: ${otp}`); //  Debugging
      await OTP.create({ userId, otp });
      return otp;
    } catch (error) {
      console.error(' OTP Creation Error:', error);
      throw new Error('Failed to generate OTP.');
    }
  }

  // generate otp for email
  static async generateEmailOtp(userId) {
    try {
      let otp;
      do {
        otp = otpGenerator.generate(6, { upperCaseAlphabets: false,lowerCaseAlphabets: false, specialChars: false
        });
      } while (isNaN(otp));
      console.log(` Generated OTP For Email: ${otp}`); //  Debugging
      await EmailOtp.create({ userId, otp });
      return otp;
    } catch (error) {
      console.error(' OTP Creation Error:', error);
      throw new Error('Failed to generate OTP.');
    }
  }

  //  Simulate sending OTP (Replace with actual SMS/email service)
  static async sendOtpToUser(phone, otp) {
    try {
      console.log(` Sending OTP: ${otp} to phone: ${phone}`);
      // Implement SMS/Email API call here
    } catch (error) {
      console.error(' OTP Sending Error:', error);
      throw new Error('Failed to send OTP.');
    }
  }
  //  Verify OTP (Check & Delete after successful verification)
  static async verifyOtp(userId, enteredOtp) {
    try {
      const record = await OTP.findOne({ userId, otp: enteredOtp }).exec();
      if (!record) {
        console.log(' Invalid or expired OTP.');
        return false;
      }
      await OTP.deleteOne({ _id: record._id }); //  Delete OTP after use
      return true;
    } catch (error) {
      console.error(' Error verifying OTP:', error);
      return false;
    }
  }
  //  Hash Password
  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      console.error(' Error hashing password:', error);
      throw new Error('Password hashing failed.');
    }
  }
  //  Compare Password
  static async comparePassword(enteredPassword, savedPassword) {
    try {
      return await bcrypt.compare(enteredPassword, savedPassword);
    } catch (error) {
      console.error(' Error comparing password:', error);
      throw new Error('Password comparison failed.');
    }
  }
  //  Generate JWT Token
  static generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
  }
}

module.exports = Helper;
