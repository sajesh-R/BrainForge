const chatService = require('../../services/chat/ChatService');
const courseService = require('../../services/course/courseService');

exports.sendMessage = async (req, res) => {
    try {
        const { content, courseId, userId } = req.body;
        const filePath = req.file ? `/uploads/${req.file.filename}` : null;

        if (!content && !filePath) {
            return res.status(400).json({ message: 'Message content or file is required' });
        }

        const message = await chatService.sendMessage({
            content: content || '',
            courseId,
            userId,
            filePath
        });

        res.status(201).json({
            message: 'Message sent successfully',
            data: message
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { courseId } = req.params;
        const messages = await chatService.getMessagesByCourse(courseId);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRecentMessages = async (req, res) => {
    try {
        const enrollments = await courseService.fetchUserEnrollments(req.user._id);
        const courseIds = enrollments.map(e => e.course._id);
        const messages = await chatService.getRecentMessagesForCourses(courseIds);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
