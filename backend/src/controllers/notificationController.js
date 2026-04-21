const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Get notifications
 * GET /api/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page, limit, unreadOnly } = req.query;

    const result = await Notification.findByUser(req.userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await Notification.getUnreadCount(req.userId);

    res.json({
      ...result,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to get notifications'
    });
  }
};

/**
 * Get unread count
 * GET /api/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.userId);

    res.json({
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to get count'
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.markRead(req.params.id, req.userId);

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    res.json({
      message: 'Marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Failed to mark as read'
    });
  }
};

/**
 * Mark all as read
 * PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const count = await Notification.markAllRead(req.userId);

    res.json({
      message: 'All notifications marked as read',
      count
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all as read'
    });
  }
};

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!result) {
      return res.status(404).json({
        error: 'Notification not found'
      });
    }

    res.json({
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification'
    });
  }
};

/**
 * Register push token
 * POST /api/notifications/push-token
 */
exports.registerPushToken = async (req, res) => {
  try {
    const { token } = req.body;

    await User.findByIdAndUpdate(req.userId, { pushToken: token });

    res.json({
      message: 'Push token registered'
    });
  } catch (error) {
    console.error('Register push token error:', error);
    res.status(500).json({
      error: 'Failed to register push token'
    });
  }
};
