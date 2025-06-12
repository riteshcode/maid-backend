const { check } = require('express-validator');

exports.validateJob = [
  check("userId")
    .notEmpty().withMessage("userId is required")
    .isMongoId().withMessage("Invalid userId"),

  check("CleanerId")
    .notEmpty().withMessage("CleanerId is required")
    .isMongoId().withMessage("Invalid CleanerId"),

  check("CleaningServiceId")
    .notEmpty().withMessage("CleaningServiceId is required")
    .isMongoId().withMessage("Invalid CleaningServiceId"),

  check("country").notEmpty().withMessage("Country is required"),
  check("state").notEmpty().withMessage("State is required"),
  check("city").notEmpty().withMessage("City is required"),
  check("pinCode").notEmpty().withMessage("Pin code is required"),

  check("jobDate")
    .notEmpty().withMessage("Job date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Invalid date format, expected yyyy-mm-dd"),

  check("jobTime")
    .notEmpty().withMessage("Job time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage("Invalid time format, expected HH:mm"),

  check("areaSize")
    .notEmpty().withMessage("Area size is required")
    .isIn(['Small', 'Medium', 'Large']).withMessage("Invalid area size"),

  check("bedrooms")
    .optional()
    .isInt({ min: 0 }).withMessage("Bedrooms must be a non-negative number"),

  check("bathrooms")
    .optional()
    .isInt({ min: 0 }).withMessage("Bathrooms must be a non-negative number"),

  check("latitude")
    .optional()
    .isFloat().withMessage("Latitude must be a number"),

  check("longitude")
    .optional()
    .isFloat().withMessage("Longitude must be a number"),

  check("status")
    .optional()
    .isIn(['Pending', 'In-Progress', 'Completed', 'Rejected']).withMessage("Invalid status"),
];