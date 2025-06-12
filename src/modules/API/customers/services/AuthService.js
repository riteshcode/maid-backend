const User = require("../../../models/user.model");
const otpHelper = require("../helpers/otpHelper");
const tokenHelper = require("../helpers/tokenHelper");
const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto"); // Node.js built-in module, no need to install
const { userSingleCollection } = require("../collection/UserCollection");

const { generateOtp } = require("../../../helper/globalHelper");

const { sendMessages } = require("../../../Services/TwilioService");

const OtpModel = require("../../../models/otp.model");
const { sendEmail } = require("../../../Services/EmailService");
const { log } = require("console");
const { customerEvent } = require("../events/CustomerEvent");

// Register a new user
async function registerUser(userData) {
  const user = new User(userData);
  const userSaved = await user.save();
  let userFormatted = await userSingleCollection(userSaved);

  // send welcome email/messages
  customerEvent.emit('welcome-email-customer-event', user);

  return userFormatted;
}

// Login a user status: 'Pending'
async function loginUser(email, password) {
  const user = await User.findOne({ email });

  if (!user) throw new Error("Invaid email.");

  if (!user.isVerified) throw new Error("User has not verified their OTP.");

  if (user.status !== "Active") throw new Error("Your account is blocked by MaidHive. Please contact MaidHive");

  const isMatch = await user.comparePassword(password);

  if (!isMatch) throw new Error("Incorrect password.");

  let userFormatted = await userSingleCollection(user);

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '9h' });
  userFormatted.token = token;
  console.log('Login suer with token', user, token);

  // send welcome email
  // customerEvent.emit('welcome-email-customer-event', user);
  
  return userFormatted;
}

// Generate OTP for a user
async function generateAndSendOtp(mobile) {
  let otp = generateOtp();

  // remove old otp if user generate new otp
  await OtpModel.findOneAndDelete({ mobile:mobile });
 
  // save new otp with mobile number
  await new OtpModel({
    mobile:mobile,
    otp:otp
  }).save();

  // send Mesage using twilio
  let Mesage = `Your verification code is  ${otp}. Thanks MaidHive`;
  await sendMessages(mobile, Mesage);
  // await sendEmail('nomis54170@clubemp.com', Mesage, Mesage);
  
  return otp;
}

// Verify OTP and update user status
async function verifyOtp(mobile, otp) {
  let matchStatus = false;
  const match = await OtpModel.findOne({
    mobile:mobile,
    otp:otp
  });

  if(match){
    matchStatus = true;
    await OtpModel.findOneAndDelete({ mobile:mobile });
  }

  return matchStatus;
}
// through which mail the otp will be send
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Password Reset Link (New Function)
async function sendPasswordResetLink(email) {
  const user = await User.findOne({ email });
  if (!user)
    throw { success: false, message: "User with this email does not exist." };

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiration
  await user.save();

  const resetUrl = `http://localhost:4000/api/auth/reset-password/${token}`;
  console.log("Generated Reset URL:", resetUrl);

  await transporter.sendMail({
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "Password Reset",
    html: `<p>You requested a password reset</p><p>Click this <a href="${resetUrl}">link</a> to reset your password.</p>`,
  });
}


// changePassword 
async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error('Old password is incorrect');
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await User.findByIdAndUpdate({ _id: user?._id }, { password: hashedPassword })
}


module.exports = {
  registerUser,
  loginUser,
  generateAndSendOtp,
  verifyOtp,
  sendPasswordResetLink,
  changePassword,
  
};
