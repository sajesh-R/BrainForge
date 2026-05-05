const assignmentService = require('../../services/assignment/assignmentService');
const courseService = require('../../services/course/courseService');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../../middleware/uploadMiddleware');
const notificationController = require('../notification/notificationController');
const Assignment = require('../../models/assignment/Assignment');
const User = require('../../models/auth/User');




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

        // Notify all enrolled students
        try {
            const enrolledUserIds = await courseService.fetchCourseEnrolledUsers(courseId);
            const course = await courseService.fetchCourseById(courseId);
            
            console.log(`[DEBUG] New Assignment: Found ${enrolledUserIds.length} students to notify in course ${courseId}`);

            for (const userId of enrolledUserIds) {
                await notificationController.createNotification(
                    userId,
                    'New Assignment Added',
                    `A new assignment "${title}" has been added to ${course.title}.`,
                    'ASSIGNMENT',
                    `/courses/${courseId}`
                );

            }
        } catch (error) {
            console.error('Error sending assignment creation notifications:', error);
        }


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
        
        // If logged in student, attach their submission status
        if (req.user && req.user.role === 'Student') {
            const Submission = require('../../models/assignment/Submission');
            const submissions = await Submission.find({ 
                user: req.user._id,
                assignment: { $in: assignments.map(a => a._id) }
            });

            const assignmentsWithStatus = assignments.map(assignment => {
                const userSubmission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
                return {
                    ...assignment._doc,
                    isSubmitted: !!userSubmission,
                    submission: userSubmission || null
                };
            });
            return res.status(200).json(assignmentsWithStatus);
        }

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
            return res.status(400).json({ message: 'Assignment ID and User ID are required' });
        }


        const submission = await assignmentService.submitAssignment({
            assignment: assignmentId,
            user: userId,
            filePath: req.file.location, // S3 URL
            originalName: req.file.originalname,
        });

        // Notify the Instructor
        try {
            const assignment = await Assignment.findById(assignmentId).populate('course');
            const course = await courseService.fetchCourseById(assignment.course._id);
            const student = await User.findById(userId);

            const instructorId = course.instructor._id.toString();
            
            console.log(`[DEBUG] Assignment Submission: Sender=${userId}, Recipient=${instructorId}`);

            // Only notify if the sender is not the instructor themselves
            if (instructorId !== userId.toString()) {
                await notificationController.createNotification(
                    instructorId,
                    'New Assignment Submission',
                    `${student.name} submitted an assignment for ${course.title}`,
                    'ASSIGNMENT',
                    `/courses/${course._id}`
                );


            }
        } catch (error) {
            console.error('Error sending assignment submission notification:', error);
        }


        res.status(201).json({
            message: 'Assignment submitted successfully',
            submission,
        });

    } catch (error) {
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

        // Extract key from S3 URL
        const url = new URL(submission.filePath);
        const key = url.pathname.substring(1);

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        res.redirect(signedUrl);
    } catch (error) {
        console.error('Signed URL Error:', error);
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

        // Fetch user's submissions to check which ones are done
        const Submission = require('../../models/assignment/Submission');
        const submissions = await Submission.find({ user: req.user._id });

        // Map submissions to assignments
        const assignmentsWithStatus = assignments.map(assignment => {
            const userSubmission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
            return {
                ...assignment._doc,
                isSubmitted: !!userSubmission,
                submission: userSubmission || null
            };
        });

        res.status(200).json(assignmentsWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

