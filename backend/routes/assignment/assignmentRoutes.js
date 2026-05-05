const express = require('express');
const router = express.Router();
const {
    createAssignment,
    getAssignmentsByCourse,
    submitAssignment,
    getSubmissionsByAssignment,
    getSubmissionFile,
    getUserAssignments,
} = require('../../controllers/assignment/assignmentController');
const { upload } = require('../../middleware/uploadMiddleware');

const { protect } = require('../../middleware/authMiddleware');

// Route for creating an assignment
router.post('/', protect, createAssignment);

// Route for getting assignments for enrolled courses
router.get('/user', protect, getUserAssignments);

// Route for getting assignments by course ID
router.get('/course/:courseId', protect, getAssignmentsByCourse);

// Route for submitting an assignment
router.post('/submit', protect, upload.single('file'), submitAssignment);

// Route for getting submissions for an assignment
router.get('/:assignmentId/submissions', protect, getSubmissionsByAssignment);

// Route for downloading submission file
router.get('/submission/:id/download', protect, getSubmissionFile);

module.exports = router;
