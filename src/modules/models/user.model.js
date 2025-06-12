const mongoose = require("mongoose");
var bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false, unique: true },
    mobile: { type: String, required: false, unique: true },
    password: { type: String, required: true },
    profileImage: {
      type: String,
      required: false,
      default: null,
      set: (v) => (v === "" ? null : v),
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      default: null,
      set: (v) => (v === "" ? null : v),
    },
    planExpiredDate: {
      type: Date,
      default: null,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    isSocialMediaSignUp: { type: Boolean, default: false },
    isSocialMediaSignUpPlatform: {
      type: String,
      required: false,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "In-Verification", "Inactive"],
      default: "Pending",
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
    deletedAt: { type: Date, default: null }, // Timestamp for deletion
    
    resetOtp: {
      type: String,
      default: null
    },
    resetOtpExpires: {
      type: Date,
      default: null
    }
    
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Middleware to exclude soft-deleted records from all queries
UserSchema.pre(/^find(?!OneAndUpdate)/, function (next) {
  this.where({ isDeleted: false });
  next();
});

// check expriy column and set virtual cloumn to pass in json
UserSchema.virtual("isPlanActive").get(function () {
  if (!this.planExpiredDate) return false;
  return this.planExpiredDate > new Date();
});

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  var user = this;
  if (!user.isModified("password")) return next();

  try {
    var hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

// Compare hashed passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
