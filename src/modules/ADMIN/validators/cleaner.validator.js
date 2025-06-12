const { body } = require("express-validator");
const Cleaners = require("../../models/cleaners.model");

exports.validateCleaner = [
  body("firstName").notEmpty().withMessage("Name is required"),
  body("lastName").notEmpty().withMessage("Name is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const existingUser = await Cleaners.findOne({ email });
      if (existingUser) {
        throw new Error("Email already exist");
      }
    }),
  body("mobile")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid mobile format")
    .custom(async (mobile) => {
      const existingUser = await Cleaners.findOne({ mobile });
      if (existingUser) {
        throw new Error("Mobile already exist");
      }
    }),
  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be between 0 and 5"),
  body("hourlyRate")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Hourly rate must be a positive number"),
  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be a boolean"),
  body("backgroundChecked")
    .optional()
    .isBoolean()
    .withMessage("Background check must be a boolean"),
  body("status")
    .optional()
    .isIn(["Pending", "Active", "In-Verification", "Inactive"])
    .withMessage("Invalid status"),
];

exports.validateCleanerUpdate = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const existingUser = await Cleaners.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new Error("Email already in use");
      }
    }),
  body("mobile")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid email format")
    .custom(async (mobile, { req }) => {
      const existingUser = await Cleaners.findOne({ mobile });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new Error("Mobile already in use");
      }
    }),
];
exports.validateCleanerLogin= [
  body("email")
    .optional()
    .isEmail()
    .isEmpty()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const existingUser = await Cleaners.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new Error("Email already in use");
      }
    }),
    body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];
