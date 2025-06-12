const { body } = require("express-validator");

const SubscriptionPlan = require("../../models/subscription-plan.model");

exports.validateSubscriptionCreate = [
  body("name")
    .notEmpty()
    .custom(async (name) => {
      const existing = await SubscriptionPlan.findOne({ name });
      if (existing) {
        throw new Error("Name already exist. Please add new plan name");
      }
    })
    .withMessage("Name is required"),
  body("price").notEmpty().withMessage("Please enter plan price"),
  body("benefits").notEmpty().withMessage("Benefits is required"),
];

exports.validateSubscriptionUpdate = [
  body("name")
    .optional()
    .custom(async (name, { req }) => {
      const existing = await SubscriptionPlan.findOne({ name });
      if (existing && existing._id.toString() !== req.params.id) {
        throw new Error("Name already exist. Please add new plan name");
      }
    })
    .withMessage("Name is required"),
];
