const { getUserNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../services/notificationService');

module.exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await getUserNotifications(userId);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        await markAsRead(id);
        res.status(200).json({ message: 'Marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await markAllAsRead(userId);
        res.status(200).json({ message: 'All marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports.deleteNotificationController = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await deleteNotification(id, userId);
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
