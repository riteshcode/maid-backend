const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    CleanerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cleaner', required: true },
    CleaningServiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'cleaningService', required: true },

    address: { type: String , default: null,},
    country: {
        type: String,
        default: null,
        required: true,
    },
    state: {
        type: String,
        default: null,
        required: true,
    },
    city: {
        type: String,
        default: null,
        required: true,
    },
    pinCode: {
        type: String,
        default: null,
        required: true,
    },
    latitude: {
        type: Number,
        
    },
    longitude: {
        type: Number,
       
    },
    
    jobDate: {
        type: Date,
        default: null,
        required: true
    },
    jobTime: {
        type: String,
        default: null,
        required: true
    },
    areaSize: {
        type: String,
        default: null,
        enum: ['Small', 'Medium', 'Large'],
        required: true
    },
    numberOfRoom:{type:String,default:null},
    bedrooms: {
        type: Number,
        default: null,
       
    },
    bathrooms: {
        type: Number,
        default: null,
       
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'In-Progress', 'Completed', 'Rejected']
    },
   
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    isCompleted:{type:Boolean,default:false},
    completedAt:{type:Date, default: Date.now},//Timestamp for completion

    isRejected:{type:Boolean, default:false},
    rejectedAt:{type: Date, default: Date.now},// Timestamp for Rejection

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date,  default: Date.now }, //Timestamp for deletion

}, {
    timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);


