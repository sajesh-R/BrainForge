const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, subscribe } = require('../../controllers/notification/notificationController');
const { protect } = require('../../middleware/authMiddleware');

router.get('/', protect, getNotifications);
router.post('/subscribe', protect, subscribe);
router.put('/:id/read', protect, markAsRead);


module.exports = router;
