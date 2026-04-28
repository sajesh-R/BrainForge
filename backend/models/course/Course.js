const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Course description is required'],
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Instructor ID is required'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Course', courseSchema);
