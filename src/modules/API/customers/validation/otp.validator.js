const { body } = require("express-validator");

exports.sendOtp = [
    body("mobile").notEmpty().withMessage("Enter mobile number with country code")
];

exports.verifyOtp = [
    body('mobile').notEmpty().withMessage("Enter mobile number"),
    body('otp').notEmpty().withMessage("Enter otp to verify.")
];