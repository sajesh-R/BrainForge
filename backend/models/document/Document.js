const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    tags: [{
        type: String
    }],
});

module.exports = mongoose.model('Document', documentSchema);
