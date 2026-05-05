const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    content: {
        type: String,
        default: ''
    },
    filePath: {
        type: String,
        default: null
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    chatSession: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: false
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatGroup',
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', MessageSchema);
