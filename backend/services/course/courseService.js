const Course = require('../../models/course/Course');
const Enrollment = require('../../models/course/Enrollment');
const SmartFeaturesService = require('../smart/smartFeaturesService');
const notificationController = require('../../controllers/notification/notificationController');

exports.createNewCourse = async (courseData) => {
    const { title, description, instructorId, videoUrl } = courseData;

    const course = await Course.create({
        title,
        description,
        instructor: instructorId,
        videoUrl: videoUrl || '',
    });

    return course;
};

exports.updateCourseVideo = async (courseId, videoUrl) => {
    const course = await Course.findByIdAndUpdate(
        courseId,
        { videoUrl },
        { new: true, runValidators: true }
    );

    if (!course) {
        throw new Error('Course not found');
    }

    return course;
};

exports.fetchAllCourses = async () => {
    return await Course.find().populate('instructor', 'name email');
};

exports.fetchCourseById = async (id) => {
    const course = await Course.findById(id).populate('instructor', 'name email');
    if (!course) {
        throw new Error('Course not found');
    }
    return course;
};

exports.enrollUserInCourse = async (userId, courseId) => {
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error('Course not found');
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (existingEnrollment) {
        throw new Error('User is already enrolled in this course');
    }

    const enrollment = await Enrollment.create({
        user: userId,
        course: courseId,
    });

    await SmartFeaturesService.logActivity(userId, 'ENROLLMENT', `Enrolled in course: ${course.title}`, 50);

    await notificationController.createNotification(
        userId,
        'Welcome to the Course!',
        `You have successfully enrolled in ${course.title}. Happy learning!`,
        'SUCCESS',
        `/courses/${courseId}`
    );


    return enrollment;
};

exports.fetchUserEnrollments = async (userId) => {
    return await Enrollment.find({ user: userId }).populate('course');
};

exports.fetchCourseEnrolledUsers = async (courseId) => {
    const enrollments = await Enrollment.find({ course: courseId }).select('user');
    return enrollments.map(e => e.user);
};

