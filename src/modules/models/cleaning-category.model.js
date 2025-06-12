const mongoose = require("mongoose");

const CleaningCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CleaningCategory", // self-reference
      default: null,
    },
    categoryImage: {
      type: String,
      required: false,
      default: null,
      set: (v) => (v === "" ? null : v),
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CleaningCategory", CleaningCategorySchema);
