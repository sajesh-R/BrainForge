const express = require('express');
const router = express.Router();
const {
    createCourse,
    getAllCourses,
    getCourseById,
    enrollInCourse,
    getEnrolledCourses,
} = require('../../controllers/course/courseController');
const { protect, optionalProtect } = require('../../middleware/authMiddleware');

router.route('/').get(getAllCourses).post(protect, createCourse);
router.route('/enrolled').get(protect, getEnrolledCourses);
router.route('/enroll').post(protect, enrollInCourse);
router.route('/:id').get(optionalProtect, getCourseById);

module.exports = router;
