const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getRecentMessages } = require('../../controllers/chat/ChatController');
const upload = require('../../middleware/uploadMiddleware');
const { protect } = require('../../middleware/authMiddleware');

// Route for sending a message (text and/or file)
router.post('/send', protect, upload.single('file'), sendMessage);

// Route for getting recent messages across all enrolled courses
router.get('/recent', protect, getRecentMessages);

// Route for getting messages by course ID
router.get('/:courseId', protect, getMessages);

module.exports = router;
