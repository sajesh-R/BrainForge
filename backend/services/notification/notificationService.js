const Notification = require('../../models/notification/Notification');
const webpush = require('web-push');
const User = require('../../models/auth/User');

// Configure web-push with VAPID keys
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error('[CRITICAL] VAPID Keys are missing in .env file!');
}

webpush.setVapidDetails(
    'mailto:support@lms.com',
    String(process.env.VAPID_PUBLIC_KEY || ''),
    String(process.env.VAPID_PRIVATE_KEY || '')
);



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

exports.createNotification = async (userId, title, message, type = 'INFO', url = '/notifications') => {
    // 1. Save to Database
    const notification = await Notification.create({
        user: userId,
        title,
        message,
        type
    });


    // 2. Send Web Push
    try {
        const user = await User.findById(userId);
        console.log(`[PUSH DEBUG] Attempting push to user: ${user?.email}`);
        
        if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
            console.log(`[PUSH DEBUG] Found ${user.pushSubscriptions.length} subscriptions`);
            
            const payload = JSON.stringify({
                title: title,
                body: message,
                icon: '/logo192.png',
                data: { url: url }
            });


            // Send to all registered devices for this user
            const pushPromises = user.pushSubscriptions.map((subscription, index) => {
                console.log(`[PUSH DEBUG] Sending to subscription #${index + 1}`);
                return webpush.sendNotification(subscription, payload)
                    .then(() => console.log(`[PUSH DEBUG] Subscription #${index + 1} sent successfully`))
                    .catch(err => {
                        console.error(`[PUSH DEBUG] Subscription #${index + 1} failed:`, err.statusCode, err.message);
                        if (err.statusCode === 410 || err.statusCode === 404) {
                            return 'REMOVE';
                        }
                        return 'ERROR';
                    });
            });

            const results = await Promise.all(pushPromises);
            
            // Clean up invalid subscriptions
            if (results.includes('REMOVE')) {
                console.log('[PUSH DEBUG] Cleaning up expired subscriptions');
                user.pushSubscriptions = user.pushSubscriptions.filter((_, index) => results[index] !== 'REMOVE');
                await user.save();
            }
        } else {
            console.log('[PUSH DEBUG] No push subscriptions found for this user');
        }
    } catch (error) {
        console.error('[PUSH DEBUG] Critical Push Error:', error);
    }


    return notification;
};

