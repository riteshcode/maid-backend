const { body, validationResult } = require("express-validator");

const User = require("../../models/user.model");

exports.validateUserRegister = [
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

exports.validateUserUpdate = [
  body("email")
  .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new Error("Email already in use");
      }
    }),
  body("mobile")
  .optional()
    .isMobilePhone()
    .withMessage("Invalid email format")
    .custom(async (mobile, { req }) => {
      const existingUser = await User.findOne({ mobile });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new Error("Mobile already in use");
      }
    }),
];
