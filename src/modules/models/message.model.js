const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    senderType: { type: String, enum: ["admin", "cleaner", "user"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "senderType" },
    message: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, refPath: "senderType" }],
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
