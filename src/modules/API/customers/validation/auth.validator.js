const { body, check, validationResult } = require("express-validator");
const User = require("../../../models/user.model");

exports.validateRegistration = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("Email already exist");
      }
    }),
  body("mobile")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid mobile format")
    .custom(async (mobile) => {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) {
        throw new Error("Mobile already exist");
      }
    }),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.validateOtp = [
  check("phone").isMobilePhone().withMessage("Invalid phone number."),
  check("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be a 6-digit code."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.validateLogin = [
  check("email").isEmail().withMessage("Invalid email format."),
  check("password").notEmpty().withMessage("Password is required."),
];

exports.verifyDetail = [
  body("email")
  .optional()
  .isEmail()
  .withMessage("Invalid email format")
  .custom(async (email) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already exist");
    }
  }),
body("mobile")
  .optional()
  .isMobilePhone()
  .withMessage("Invalid mobile format")
  .custom(async (mobile) => {
    const existingUser = await User.findOne({ mobile });
    if (existingUser) {
      throw new Error("Mobile already exist");
    }
  }),
]
