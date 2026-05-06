const chatService = require('../../services/chat/ChatService');
const courseService = require('../../services/course/courseService');
const notificationController = require('../notification/notificationController');
const User = require('../../models/auth/User');
const ChatGroup = require('../../models/chat/ChatGroup');

exports.sendMessage = async (req, res) => {
    try {
        const { content, userId, receiverId, chatId, groupId } = req.body;
        const filePath = req.file ? req.file.location : null; // S3 URL

        if (!content && !filePath) {
            return res.status(400).json({ message: 'Message content or file is required' });
        }

        const senderId = userId || req.user._id;

        const message = await chatService.sendMessage({
            content: content || '',
            userId: senderId,
            receiverId,
            chatId,
            groupId,
            filePath
        });

        // Push Notifications
        try {
            const sender = await User.findById(senderId);
            
            if (receiverId) {
                await notificationController.createNotification(
                    receiverId,
                    `New message from ${sender.name}`,
                    `${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                    'CHAT',
                    `/chat`
                );
            } else if (groupId) {
                const group = await ChatGroup.findById(groupId);
                if (group) {
                    const notifyPromises = group.members
                        .filter(memberId => memberId.toString() !== senderId.toString())
                        .map(memberId => 
                            notificationController.createNotification(
                                memberId,
                                `New message in ${group.name}`,
                                `${sender.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                                'CHAT',
                                `/chat`
                            )
                        );
                    await Promise.all(notifyPromises);
                }
            }
        } catch (pushError) {
            console.error('Failed to send chat push notification:', pushError);
        }

        res.status(201).json({
            message: 'Message sent successfully',
            data: message
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('name email role');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.startChat = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const session = await chatService.getOrCreateChatSession(req.user._id, receiverId);
        res.status(200).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { chatId, groupId } = req.body;
        await chatService.markMessagesAsRead(chatId, groupId, req.user._id);
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getDirectMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const messages = await chatService.getDirectMessages(chatId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserChats = async (req, res) => {
    try {
        const chats = await chatService.getUserChats(req.user._id);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.createGroup = async (req, res) => {
    try {
        const { name, memberIds } = req.body;
        const group = await chatService.createGroup(name, req.user._id, memberIds);
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserGroups = async (req, res) => {
    try {
        const groups = await chatService.getUserGroups(req.user._id);
        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await chatService.getGroupMessages(groupId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addGroupMember = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { memberIds } = req.body;
        const group = await chatService.addGroupMembers(groupId, memberIds, req.user._id);
        res.status(200).json(group);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

exports.removeUserFromGroup = async (req, res) => {
    try {
        const { groupId, userId } = req.params;
        const group = await chatService.removeUserFromGroup(groupId, userId, req.user._id);
        res.status(200).json(group);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

exports.deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const result = await chatService.deleteGroup(groupId, req.user._id);
        res.status(200).json(result);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};
