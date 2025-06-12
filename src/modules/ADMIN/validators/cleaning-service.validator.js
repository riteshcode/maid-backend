const { body, validationResult } = require("express-validator");

const User = require("../../models/user.model");

exports.validateCleaningService = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("bestFor")
    .isArray({ min: 1 })
    .withMessage("BestFor must be an array with at least one value"),
  body("includes")
    .isArray({ min: 1 })
    .withMessage("Includes must be an array with at least one value"),
  body("frequency")
    .isIn(["One Time", "Weekly", "Bi-Weekly", "Monthly", "Every 3-6 Months"])
    .withMessage("Invalid frequency"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
];