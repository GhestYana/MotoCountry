const express = require('express');
const router = express.Router();
const { isClientLogged } = require('../middleware/isClientLogged');
const { getNotifications, markRead, markAllRead, deleteNotificationController } = require('../controllers/notificationController');

router.get('/', isClientLogged, getNotifications);
router.patch('/read-all', isClientLogged, markAllRead);
router.patch('/:id/read', isClientLogged, markRead);
router.delete('/:id', isClientLogged, deleteNotificationController);

module.exports = router;
