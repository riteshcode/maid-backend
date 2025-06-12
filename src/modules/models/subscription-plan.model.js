const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // enum: ["Honeycomb", "Busy Bee", "Queen Bee"],
      required: true,
      unique: true,
    },
    planImage: {
      type: String,
      required: false,
      default: null,
      set: (v) => (v === "" ? null : v),
    },
    description: {
      type: String,
    },
    benefits: [
      {
        type: String,
      },
    ],
    discountPercentage: {
      type: Number,
      default: 0,
    },
    priorityLevel: {
      type: String,
      enum: ["low", "standard", "high"],
      default: "low",
    },
    freeAddOnPerMonth: {
      type: Boolean,
      default: false,
    },
    freeAddOnOptions: [
      {
        type: String,
      },
    ],
    hasExclusiveAccess: {
      type: Boolean,
      default: false,
    },
    appFeatureAccess: {
      type: Boolean,
      default: false,
    },
    productDiscountAccess: {
      type: Boolean,
      default: false,
    },
    planTenure: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
      required: true,
    },
    price: {
      type: Number, // Add pricing if applicable
      default: 0,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
    },
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
    deletedAt: { type: Date, default: null }, // Timestamp for deletion
  },
  {
    timestamps: true,
  }
);

// Middleware to exclude soft-deleted records from all queries
subscriptionPlanSchema.pre(/^find(?!OneAndUpdate)/, function (next) {
    this.where({ isDeleted: false });
    next();
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
