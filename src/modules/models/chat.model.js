const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    participants: [
        {
            userType: { type: String, enum: ["admin", "cleaner", "user"], required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "participants.userType" }
        }
    ],
    lastMessage: { type: String },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
