const { validationResult } = require("express-validator");
const AuthService = require("../services/AuthService");
const logger = require("../../../../utils/logger");
const User = require("../../../models/user.model");
const responseHandler = require("../../../helper/response");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailOtpModel = require("../../../models/email-otp.model");
const { log } = require("console");


// User Registration
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }

    const { name, email, mobile, password, status, isVerified } = req.body;
    const savedUser = await AuthService.registerUser({
      name,
      email,
      mobile,
      password,
      status,
      isVerified,
    });
    return res.status(200).json({
      success: true,
      message: "User registered successfully. Please login.",
      data: savedUser,
    });
  } catch (err) {
    logger.error(
      `API: AuthController : Register - Request ${JSON.stringify(
        req.body
      )} Error: ${err.message}`
    );

    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || err,
    });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }

    const { email, password } = req.body;
    const user = await AuthService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful .",
      data: user,
    });
  } catch (error) {
    logger.error(
      `API: AuthController - Request ${JSON.stringify(req.body)} Error: ${error.message
      }`
    );
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// Send OTP to Phone
exports.sendMobileOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }

    const { mobile } = req.body;

    logger.error(
      `API: AuthController - Request ${JSON.stringify(
        req.body
      )} Error: ${mobile}`
    );
    
    

    // generate and send otp
    await AuthService.generateAndSendOtp(mobile);
    
    res.status(200).json({
      success: true,
      message: "OTP sent to your phone number.",
      data: null,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      data: null, 
    });
  }
};


// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({
        status: false,
        errors: errors.array(),
        message: "Validation error",
        data: null,
      });
    }

    const { mobile, otp, } = req.body;
    const status = await AuthService.verifyOtp(mobile, otp);
    if (status) {
      return res.status(200).json({
        success: true,
        message: "OTP Verification successfull.",
        data: null,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "OTP Verification failed.",
        data: null,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, data: null });
  }
};

// Forgot Password Controller
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return responseHandler.badRequest(res, 'Email is required');
  try {
    const user = await User.findOne({ email });
    if (!user) return responseHandler.notFound(res, 'User not found with this email');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await emailOtpModel.deleteMany({ email });
    await emailOtpModel.create({ email, otp, expiresAt });
    return responseHandler.success(res, "OTP sent. Please verify the OTP to reset password.", { otp, userId: user._id });
  } catch (error) {
    return responseHandler.error(res, 'Error In Sending Otp');
  }
};

//verify email for forgot password 
exports.verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return responseHandler.badRequest(res, 'Email and OTP are required');
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return responseHandler.notFound(res, 'User not found with this email');
    const record = await emailOtpModel.findOne({ email })
    if (!record) {
      return responseHandler.badRequest(res, 'Invalid or expired OTP');
    }
    if (record.expiresAt < new Date()) {
      await emailOtpModel.deleteOne({ _id: record._id });
      return responseHandler.badRequest(res, 'OTP expired. Please request a new one.');
    }
    await emailOtpModel.deleteOne({ _id: record._id });
    return responseHandler.success(res, 'OTP verified successfully. You can now reset your password.', { UserId: user._id });

  } catch (error) {
    return responseHandler.error(res, 'Otp verification Failed')
  }
};


exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.params.id;
  if (!newPassword) {
    return responseHandler.badRequest(res, 'New password is required');
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.notFound(res, 'User not found');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await User.findByIdAndUpdate({ _id: user?._id }, { password: hashedPassword })		

    return responseHandler.success(res, 'Password reset successful');
  } catch (error) {
    return responseHandler.error(res, 'Failed to reset password');
  }
};

// change password 
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return responseHandler.badRequest(res, 'Both old and new passwords are required');
  }
  try {
    const userId = req.user._id;
    await AuthService.changePassword(userId, oldPassword, newPassword);
    req.addTokenToBlacklist(req.token); 
    return responseHandler.success(res, 'Password change successful', { userId });
  } catch (error) {
    if (error.message === 'Old password is incorrect') {
      return responseHandler.badRequest(res, 'Old password is incorrect');
    }

    return responseHandler.error(res, 'Failed to change password');
  }
};


//-------------------verify contact and mobile of user -------------------------
// if the email and mobile are present in database then show - status code 302 ,,and if the email is not present in databse show status code 200

exports.verifyDetails = async (req, res) => {
  const { email, mobile } = req.body;
  if (!email && !mobile) {
    return res.status(400).json({ success: false, message: 'Please provide either email or mobile number.' });
  }
  try {
    const emailUser = email ? await User.findOne({ email }) : null;
    const mobileUser = mobile ? await User.findOne({ mobile }) : null;

    let details = {};
    let existCount = 0;
    let existingMessage = '';

    if (email) {
      if (emailUser) {
        details.email = 'Email exists in the database.';
        existCount++;
        existingMessage = 'Email exists in the database.';
      } else {
        details.email = 'Email not found in the database.';
      }
    }

    if (mobile) {
      if (mobileUser) {
        details.mobile = 'Mobile number exists in the database.';
        existCount++;
        existingMessage = 'Mobile number exists in the database.';
      } else {
        details.mobile = 'Mobile number not found in the database.';
      }
    }

    if (existCount > 0) {
      return res.status(302).json({
        success: false,
        message:
          existCount === 2
            ? 'Both email and mobile already exist in the database.'
            : existingMessage,
        details,
      });
    } else {
      // 200 - not found	
      return res.status(200).json({
        success: true,
        message:
          (email && !emailUser && !mobile) ? 'Email not found in the database.' :
            (mobile && !mobileUser && !email) ? 'Mobile number not found in the database.' :
              'Both email and mobile do not exist in the database.',
        details,
      });
    }
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error.message);
  }
};





























































