const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastMessage: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
