const  mongoose = require ('mongoose');

const bannerSchema = new mongoose.Schema({
    title:{
        type :String,
        required:true
    },
    discount:{
        type :String,
        required:true
      },
      imageURL:{
        type:String,
        required:true
    },
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
    deletedAt: { type: Date, default: null }, // Timestamp for deletion
  },{ timestamps: true }
)

// Middleware to exclude soft-deleted records from all queries
bannerSchema.pre(/^find(?!One|OneAndUpdate)/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Banner", bannerSchema);

 