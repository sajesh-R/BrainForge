const express = require('express');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getCourseById,
    enrollInCourse,
    getEnrolledCourses,
    addCourseVideo,
} = require('../../controllers/course/courseController');
const { protect, optionalProtect } = require('../../middleware/authMiddleware');

router.route('/').get(getAllCourses).post(protect, createCourse);
router.route('/enrolled').get(protect, getEnrolledCourses);
router.route('/enroll').post(protect, enrollInCourse);
router.route('/:id').get(optionalProtect, getCourseById);
router.route('/:id/video').put(protect, addCourseVideo);

module.exports = router;
