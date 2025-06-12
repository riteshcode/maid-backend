const mongoose = require("mongoose");

const cleanerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: { type: String, required: false, unique: true },
    mobile: { type: String, required: false, unique: true },
    password: { type: String, required: false },
    isSocialMediaLogin: { type: Boolean, default: false },
    isSocialMediaLoginPlatform: { type: String, required: false },
    isSocialMediaSignUp: { type: Boolean, default: false },
    isSocialMediaSignUpPlatform: { type: String, required: false },
    isBlueBadgeShow: { type: Boolean, default: false },
    profileImage: {
      type: String,
      required: false,
      default: null,
      set: (v) => (v === "" ? null : v),
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      required: false,
      default: 4.5,
    },
    hourlyRate: {
      type: Number,
      required: false,
      default: 0,
    },
    aboutMe: {
      type: String,
      required: false,
      default: null,
    },
    workingExp: {
      type: Number,
      required: false,
      default: 0,
    },
    address: {
      type: String,
      required: false,
      default: null,
    },
    state: {
      type: String,
      required: false,
      default: null,
    },
    city: {
      type: String,
      required: false,
      default: null,
    },
    country: {
      type: String,
      required: false,
      default: null,
    },
    zipcode: {
      type: String,
      required: false,
      default: null,
    },
    latitude: {
      type: String,
      required: false,
      default: null,
    },
    longitude: {
      type: String,
      required: false,
      default: null,
    },
    availability: {
      type: Boolean,
      default: false,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CleaningService',
        default: false,
      }
    ],
    cleaningCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CleaningCategory',
        default: false,
      }
    ],
    education: [
      {
        university: {
          type: String,
        },
        course: {
          type: String,
        },
        passingYear: {
          type: String,
        },
      },
    ],
    backgroundChecked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "In-Verification", "Inactive"],
      default: "Pending",
      required: true,
    },
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
    deletedAt: { type: Date, default: null }, // Timestamp for deletion
  },
  { timestamps: true }
);

cleanerSchema.pre(/^find(?!OneAndUpdate)/, function (next) {
  this.where({ isDeleted: false });
  next();
});

// virtual laoding reviews 
cleanerSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "cleanerInfo",
  options: { sort: { createdAt: -1 }, limit: 3 }, // Only 3 most recent reviews
});

const Cleaner = mongoose.model("Cleaner", cleanerSchema);

module.exports = Cleaner;
