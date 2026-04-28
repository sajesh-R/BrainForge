const Notification = require('../../models/notification/Notification');

exports.getNotificationsByUser = async (userId) => {
    return await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10);
};

exports.markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
        throw new Error('Notification not found');
    }

    if (notification.user.toString() !== userId.toString()) {
        throw new Error('Not authorized');
    }

    notification.isRead = true;
    return await notification.save();
};

exports.createNotification = async (userId, title, message, type = 'INFO') => {
    return await Notification.create({
        user: userId,
        title,
        message,
        type
    });
};
