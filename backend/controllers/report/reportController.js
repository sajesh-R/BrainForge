const Report = require('../../models/report/Report');
const Enrollment = require('../../models/course/Enrollment');
const Submission = require('../../models/assignment/Submission');

// Get all defined reports from DB
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

// Get Enrollment Report Data
exports.getEnrollmentReport = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('course', 'title description')
            .populate('user', 'name email');

        // Group by Course
        const courseData = {};
        enrollments.forEach(enroll => {
            if (!enroll.course || !enroll.user) return;
            const courseTitle = enroll.course.title;
            if (!courseData[courseTitle]) courseData[courseTitle] = [];
            courseData[courseTitle].push(enroll.user);
        });

        const structuredData = Object.keys(courseData).map(course => ({
            course,
            enrolledUsers: courseData[course]
        }));

        res.status(200).json(structuredData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching enrollment data', error: error.message });
    }
};

// Get Assignment Submission Report Data
exports.getAssignmentReport = async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('assignment', 'title description dueDate')
            .populate('user', 'name email');

        // Group by Assignment
        const assignmentData = {};
        submissions.forEach(sub => {
            if (!sub.assignment || !sub.user) return;
            const assignmentTitle = sub.assignment.title;
            if (!assignmentData[assignmentTitle]) assignmentData[assignmentTitle] = [];
            assignmentData[assignmentTitle].push({
                user: sub.user,
                submittedAt: sub.createdAt,
                originalName: sub.originalName
            });
        });

        const structuredData = Object.keys(assignmentData).map(assignment => ({
            assignment,
            submissions: assignmentData[assignment]
        }));

        res.status(200).json(structuredData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignment data', error: error.message });
    }
};
