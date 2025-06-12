
const mongoose = require('mongoose');

const cleanerhDashboardSchema = new mongoose.Schema({
    cleanerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cleaner',
        required: true,
        unique: true
    },
    totalEarning: {
        type: Number,
        default: 1050
    },
    jobsUndertaken: {
        type: Number,
        default: 78
    },
    totalWithdrawal: {
        type: Number,
        default: 450
    },
    completedJobs: {
        type: Number,
        default: 995
    },
    clientReviews: [{
        name: { type: String, },
        review: { type: String,},
        rating: { type: Number, min: 1, max: 5 }
    }]
}, { timestamps: true });

module.exports = mongoose.model('CleanerDashboard', cleanerhDashboardSchema);

