const { body } = require("express-validator");

exports.validateCleaningCategory = [
    body("name").notEmpty().withMessage("Name is required"),
];

