const mongoose = require('mongoose');

const ChatGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastMessage: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('ChatGroup', ChatGroupSchema);
