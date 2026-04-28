require('dotenv').config();
const mongoose = require('mongoose');
const SmartAssistantRule = require('./models/smart/SmartAssistantRule');

const seedRules = async () => {
    try {
        await require('./config/db')();

        const rules = [
            { keyword: 'deadline', response: 'You can check your upcoming deadlines in the "Reminders" section of your dashboard.' },
            { keyword: 'points', response: 'You earn points by enrolling in courses (50pts), submitting assignments (100pts), and uploading documents (20pts).' },
            { keyword: 'course', response: 'To enroll in a new course, visit the Courses page and click on the "Enroll" button.' },
            { keyword: 'hello', response: 'Hello! I am your LMS Smart Assistant. How can I help you today?' },
            { keyword: 'help', response: 'I can help you with information about deadlines, points, and course enrollment.' }
        ];

        await SmartAssistantRule.deleteMany({});
        await SmartAssistantRule.insertMany(rules);

        console.log('Smart Assistant rules seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding rules:', error);
        process.exit(1);
    }
};

seedRules();
