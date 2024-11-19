const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');


// Route to create an announcement
router.post('/announcements', communicationController.createAnnouncement);

// Route to get all announcements
router.get('/announcements', communicationController.getAnnouncements);

// Route to send a task notification
router.post('/notifications/send', communicationController.sendTaskNotification);

// Route to get notifications for a specific supervisor
router.get('/notifications/:supervisorId', communicationController.getNotifications);

// Route to get supervisor info
router.get('/supervisor-info', communicationController.getSupervisorInfo);

// Delete notification by ID
router.delete('/:id', communicationController.deleteNotification);

module.exports = router;
