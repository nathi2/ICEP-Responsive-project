const db = require('../config/db');

// Create a new announcement
exports.createAnnouncement = async (req, res) => {
    const { title, message } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO announcements (title, message) VALUES (?, ?)', 
            [title, message]
        );
        res.status(201).json({ message: 'Announcement created', announcementId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create announcement' });
    }
};

// Get all announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const [announcements] = await db.query('SELECT * FROM announcements');
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

// Send a notification when a manager assigns a task to a supervisor
exports.sendTaskNotification = async (req, res) => {
    const { supervisor_id, task_id, message } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO notification (userID, notificationID, message) VALUES (?, ?, ?)', 
            [supervisor_id, task_id, message]
        );
        res.status(201).json({ message: 'Notification sent', notificationId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send notification' });
    }
};

// Fetch all notifications for a specific supervisor
exports.getNotifications = async (req, res) => {
    const supervisorId = req.params.supervisorId;
    console.log("Fetching notifications for supervisorId:", supervisorId); // Log the ID here
    try {
        const [notifications] = await db.query('SELECT * FROM notification WHERE userID = ?', [supervisorId]);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Fetch supervisor details
exports.getSupervisorInfo = async (req, res) => {
    const userId = req.user.userId; // Assuming you have the user ID from the auth middleware
    try {
        const [result] = await db.query('SELECT userID FROM users WHERE userID = ?', [userId]);
        if (result.length > 0) {
            res.status(200).json({ supervisorId: result[0].supervisorId });
        } else {
            res.status(404).json({ error: 'Supervisor not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch supervisor info' });
    }
};

// Delete a notification by ID
exports.deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByIdAndDelete(id);
  
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
  
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting notification', error });
    }
  };