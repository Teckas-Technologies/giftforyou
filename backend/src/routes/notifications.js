const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { uuidParamValidator, paginationValidator } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Notifications
router.get('/', paginationValidator, notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', uuidParamValidator, notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', uuidParamValidator, notificationController.deleteNotification);
router.post('/push-token', notificationController.registerPushToken);

module.exports = router;
