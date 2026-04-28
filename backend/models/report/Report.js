const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Enrollment', 'Submission']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Report', ReportSchema);
