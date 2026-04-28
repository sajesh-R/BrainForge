const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/report/reportController');

// All routes are prepended with /api/reports in server.js
router.get('/', reportController.getAllReports);
router.get('/data/enrollments', reportController.getEnrollmentReport);
router.get('/data/assignments', reportController.getAssignmentReport);

module.exports = router;
