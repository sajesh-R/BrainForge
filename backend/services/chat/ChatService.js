const Message = require('../../models/chat/Message');

exports.sendMessage = async (messageData) => {
    const { content, courseId, userId, filePath } = messageData;

    const message = await Message.create({
        content,
        course: courseId,
        user: userId,
        filePath
    });

    return await message.populate('user', 'name email');
};

exports.getMessagesByCourse = async (courseId) => {
    return await Message.find({ course: courseId })
        .populate('user', 'name email')
        .sort({ createdAt: 1 });
};

exports.getRecentMessagesForCourses = async (courseIds) => {
    return await Message.find({ course: { $in: courseIds } })
        .populate('user', 'name email')
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .limit(10);
};
