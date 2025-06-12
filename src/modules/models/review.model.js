const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    cleanerInfo: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "Cleaner"
    }, // The user who wrote the review
    userInfo: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "User" 
    }, // The user who wrote the review

    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    }, // Star rating (1 to 5)

    reviewText: { 
        type: String, 
        maxlength: 1000 
    }, // Optional detailed review

    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
