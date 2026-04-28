require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('./models/report/Report');
const connectDB = require('./config/db');

const seedReports = async () => {
    try {
        await connectDB();

        console.log(`Seeding Admin Reports...`);

        // Clear existing reports
        await Report.deleteMany();

        const reports = [
            { title: 'General Course Enrollments', type: 'Enrollment' },
            { title: 'Assignment Submission Tracking', type: 'Submission' }
        ];

        await Report.insertMany(reports);

        console.log('Real Reports seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding real reports:', error);
        process.exit(1);
    }
};

seedReports();
