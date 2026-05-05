const express = require('express');
const router = express.Router();
const SmartFeaturesController = require('../../controllers/smart/smartFeaturesController');
const { protect, admin } = require('../../middleware/authMiddleware');

// Public or Protected routes
router.post('/assistant', protect, SmartFeaturesController.getAssistantResponse);
router.get('/timeline', protect, SmartFeaturesController.getTimeline);
router.get('/leaderboard', protect, SmartFeaturesController.getLeaderboard);
router.get('/reminders', protect, SmartFeaturesController.checkDeadlines);

// Admin only routes
router.get('/at-risk', protect, admin, SmartFeaturesController.getAtRiskUsers);
router.post('/rules', protect, admin, SmartFeaturesController.addAssistantRule);
router.get('/tagged-docs', protect, SmartFeaturesController.getTaggedDocuments);

module.exports = router;
