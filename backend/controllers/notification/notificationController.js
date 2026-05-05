const notificationService = require('../../services/notification/notificationService');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await notificationService.getNotificationsByUser(req.user._id);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        await notificationService.markAsRead(req.params.id, req.user._id);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        const status = error.message === 'Notification not found' ? 404 :
            error.message === 'Not authorized' ? 401 : 500;
        res.status(status).json({ message: error.message });
    }
};

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
exports.subscribe = async (req, res) => {
    try {
        const subscription = req.body;
        const User = require('../../models/auth/User');
        const user = await User.findById(req.user._id);

        if (!user.pushSubscriptions.find(s => s.endpoint === subscription.endpoint)) {
            user.pushSubscriptions.push(subscription);
            await user.save();
        }

        res.status(201).json({ message: 'Subscribed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Internal helper for other services
exports.createNotification = (userId, title, message, type, url) => {
    return notificationService.createNotification(userId, title, message, type, url);
};


