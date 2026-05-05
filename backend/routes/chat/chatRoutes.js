const express = require('express');
const router = express.Router();
const { sendMessage, getUsers, startChat, getDirectMessages, getUserChats, createGroup, getUserGroups, getGroupMessages, removeUserFromGroup, deleteGroup, addGroupMember } = require('../../controllers/chat/ChatController');
const { upload } = require('../../middleware/uploadMiddleware');

const { protect } = require('../../middleware/authMiddleware');

// Route for sending a message (text and/or file)
router.post('/send', protect, upload.single('file'), sendMessage);

// Group Routes
router.post('/groups', protect, createGroup);
router.get('/groups', protect, getUserGroups);
router.get('/groups/:groupId/messages', protect, getGroupMessages);
router.post('/groups/:groupId/members', protect, addGroupMember);
router.delete('/groups/:groupId/members/:userId', protect, removeUserFromGroup);
router.delete('/groups/:groupId', protect, deleteGroup);

// Route for getting all users to chat with
router.get('/users', protect, getUsers);

// Route for starting or getting a chat session
router.post('/start', protect, startChat);

// Route for getting user's chat sessions
router.get('/sessions', protect, getUserChats);

// Route for getting direct messages by chat ID
router.get('/direct/:chatId', protect, getDirectMessages);

module.exports = router;
