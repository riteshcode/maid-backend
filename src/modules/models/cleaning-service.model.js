const mongoose = require("mongoose");

const CleaningServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    bestFor: {
      type: [String], // Array of reasons why it's best
      required: true,
    },
    includes: {
      type: [String], // Array of services included
      required: true,
    },
    frequency: {
      type: String,
      enum: ["One Time", "Weekly", "Bi-Weekly", "Monthly", "Every 3-6 Months"],
      required: true,
    },
    price: {
      type: Number, // You can adjust pricing dynamically based on requirements
      required: false,
    },
  },
  { timestamps: true }
);

// Middleware to exclude soft-deleted records from all queries
// CleaningServiceSchema.pre(/^find/, function (next) {
//   this.where({ isDeleted: false });
//   next();
// });

module.exports = mongoose.model("CleaningService", CleaningServiceSchema);
