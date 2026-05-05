const courseService = require('../../services/course/courseService');
const notificationController = require('../notification/notificationController');
const User = require('../../models/auth/User');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Admin/Instructor)
exports.createCourse = async (req, res) => {
    try {
        const { title, description, instructorId } = req.body;

        if (!title || !description || !instructorId) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const course = await courseService.createNewCourse(req.body);

        // Notify all users about the new course
        try {
            const users = await User.find({}).select('_id');
            console.log(`[DEBUG] New Course: Notifying ${users.length} users about ${title}`);
            
            for (const user of users) {
                // Don't notify the instructor who created it
                if (user._id.toString() !== instructorId.toString()) {
                    await notificationController.createNotification(
                        user._id,
                        'New Course Launched!',
                        `Check out our new course: "${title}". Start learning today!`,
                        'INFO',
                        `/courses/${course._id}`
                    );

                }
            }
        } catch (pushError) {
            console.error('Failed to send new course push notifications:', pushError);
        }

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await courseService.fetchAllCourses();
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public (Enhanced if Private)
exports.getCourseById = async (req, res) => {
    try {
        const course = await courseService.fetchCourseById(req.params.id);

        let isEnrolled = false;
        // If user is logged in, check enrollment status
        // We can check if req.user exists (requires protect middleware or custom decoding)
        // For now, let's assume if they want this info they should be using a protected route or we handle it here.

        // Let's check if the service can handle enrollment check
        if (req.user) {
            const Enrollment = require('../../models/course/Enrollment');
            const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.id });
            isEnrolled = !!enrollment;
        }

        res.status(200).json({
            success: true,
            data: {
                ...course._doc,
                isEnrolled
            },
        });
    } catch (error) {
        res.status(error.message === 'Course not found' ? 404 : 500).json({ message: error.message });
    }
};

// @desc    Enroll in a course
// @route   POST /api/courses/enroll
// @access  Private
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user?._id || req.body.userId;

        if (!userId || !courseId) {
            return res.status(400).json({ message: 'User ID and Course ID are required' });
        }

        const enrollment = await courseService.enrollUserInCourse(userId, courseId);

        res.status(201).json({
            success: true,
            message: 'User enrolled successfully',
            data: enrollment,
        });
    } catch (error) {
        res.status(error.message === 'Course not found' ? 404 : 400).json({ message: error.message });
    }
};

// @desc    Get enrolled courses for a user
// @route   GET /api/courses/enrolled
// @access  Private
exports.getEnrolledCourses = async (req, res) => {
    try {
        const enrollments = await courseService.fetchUserEnrollments(req.user._id);
        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments.map(e => e.course),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add/Update course video
// @route   PUT /api/courses/:id/video
// @access  Private (Admin/Instructor)
exports.addCourseVideo = async (req, res) => {
    try {
        const { videoUrl } = req.body;
        const courseId = req.params.id;

        if (!videoUrl) {
            return res.status(400).json({ message: 'Please provide a video URL' });
        }

        const course = await courseService.updateCourseVideo(courseId, videoUrl);

        res.status(200).json({
            success: true,
            message: 'Video added to course successfully',
            data: course,
        });
    } catch (error) {
        res.status(error.message === 'Course not found' ? 404 : 500).json({ message: error.message });
    }
};
