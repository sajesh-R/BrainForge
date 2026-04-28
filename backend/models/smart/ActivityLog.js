const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['ENROLLMENT', 'SUBMISSION', 'UPLOAD', 'CHAT', 'LOGIN']
    },
    details: {
        type: String
    },
    pointsEarned: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
