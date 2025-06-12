const { body, validationResult } = require("express-validator");

const Admin = require('../../models/admin.model');

exports.validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const existingUser = await Admin.findOne({ email });
      if (existingUser) {
        throw new Error("Email already exist");
      }
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log("errors", errors);
    if (!errors.isEmpty()) {
      return res.status(403).json({ status:false, validationErrors: errors.array() });
    }
    next();
  },
];

exports.validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(403).json({ status:false, validationErrors: errors.array() });
    }
    next();
  },
];
