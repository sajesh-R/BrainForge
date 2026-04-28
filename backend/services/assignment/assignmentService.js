const Assignment = require('../../models/assignment/Assignment');
const Submission = require('../../models/assignment/Submission');
const SmartFeaturesService = require('../smart/smartFeaturesService');
const notificationController = require('../../controllers/notification/notificationController');

exports.createAssignment = async (assignmentData) => {
    return await Assignment.create(assignmentData);
};

exports.getAssignmentsByCourse = async (courseId) => {
    return await Assignment.find({ course: courseId }).sort({ createdAt: -1 });
};

exports.getAssignmentById = async (id) => {
    return await Assignment.findById(id);
};

exports.submitAssignment = async (submissionData) => {
    const submission = await Submission.create(submissionData);
    const assignment = await Assignment.findById(submissionData.assignment);

    await SmartFeaturesService.logActivity(
        submissionData.user,
        'SUBMISSION',
        `Submitted assignment: ${assignment ? assignment.title : 'Unknown'}`,
        100
    );

    await notificationController.createNotification(
        submissionData.user,
        'Assignment Submitted',
        `Your submission for ${assignment ? assignment.title : 'the assignment'} was successful.`,
        'INFO'
    );

    return submission;
};

exports.getSubmissionsByAssignment = async (assignmentId) => {
    return await Submission.find({ assignment: assignmentId }).populate('user', 'name email');
};

exports.getSubmissionById = async (id) => {
    return await Submission.findById(id).populate('user', 'name email').populate('assignment');
};

exports.getAssignmentsByCourses = async (courseIds) => {
    return await Assignment.find({ course: { $in: courseIds } })
        .populate('course', 'title')
        .sort({ dueDate: 1 });
};
