const assignmentService = require('../../services/assignment/assignmentService');
const courseService = require('../../services/course/courseService');
const fs = require('fs');
const path = require('path');

// @desc    Create an assignment
// @route   POST /api/assignments
// @access  Private
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, courseId, dueDate } = req.body;

        if (!title || !description || !courseId || !dueDate) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const assignment = await assignmentService.createAssignment({
            title,
            description,
            course: courseId,
            dueDate,
        });

        res.status(201).json({
            message: 'Assignment created successfully',
            assignment,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments by Course ID
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await assignmentService.getAssignmentsByCourse(req.params.courseId);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/submit
// @access  Private
exports.submitAssignment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { assignmentId } = req.body;
        const userId = req.user?._id || req.body.userId;

        if (!assignmentId || !userId) {
            // Delete uploaded file if validation fails
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Assignment ID and User ID are required' });
        }

        const submission = await assignmentService.submitAssignment({
            assignment: assignmentId,
            user: userId,
            filePath: req.file.path,
            originalName: req.file.originalname,
        });

        res.status(201).json({
            message: 'Assignment submitted successfully',
            submission,
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submission by ID (Download)
// @route   GET /api/assignments/submission/:id
// @access  Private
exports.getSubmissionFile = async (req, res) => {
    try {
        const submission = await assignmentService.getSubmissionById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const filePath = path.resolve(submission.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, submission.originalName);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions for an assignment
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private
exports.getSubmissionsByAssignment = async (req, res) => {
    try {
        const submissions = await assignmentService.getSubmissionsByAssignment(req.params.assignmentId);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get assignments for courses the user is enrolled in
// @route   GET /api/assignments/user
// @access  Private
exports.getUserAssignments = async (req, res) => {
    try {
        const enrollments = await courseService.fetchUserEnrollments(req.user._id);
        const courseIds = enrollments.map(e => e.course._id);
        const assignments = await assignmentService.getAssignmentsByCourses(courseIds);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
