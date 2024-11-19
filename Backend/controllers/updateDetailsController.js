const db = require('../config/db');

const updateResidentDetails = async (req, res) => {
    const userID = req.params.id;
    const { name, surname, email, phone, address } = req.body;

    if (!name || !surname || !email || !phone || !address) {
        return res.status(400).json({ message: 'Some details are missing' });
    }

    try {
        const [results] = await db.query(
            'UPDATE users SET name = ?, surname = ?, email = ?, contact = ?, address = ? WHERE id = ?',
            [name, surname, email, phone, address, userID]
        );

        if (results.affectedRows === 0) {
            return res.status(200).json({ message: 'No changes were made.' });
        }

        // Get the updated user details from the database after the update
        const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [userID]);

        res.status(200).json({ message: 'Details were updated successfully', updatedUser: updatedUser[0] });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateProfilePicture = async (req, res) => {
    const id = req.params.id;
    const profilePicture = req.file;

    if (!profilePicture) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePic = `/uploads/profilePictures/${profilePicture.filename}`;

    try {
        await db.query('UPDATE users SET profilePic = ? WHERE id = ?', [profilePic, id]);
        res.status(200).json({ message: 'Profile picture updated successfully', profilePic });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getUsersByRole = async (req, res) => {
    try {
        // Fetch all users with roleID 1, 2, or 4
        const [users] = await db.query('SELECT * FROM users WHERE roleID IN (1, 2, 4)');

        // Group users by role
        const groupedUsers = users.reduce((acc, user) => {
            if (user.roleID === 1) acc.admins.push(user);
            if (user.roleID === 2) acc.managers.push(user);
            if (user.roleID === 4) acc.supervisors.push(user);
            return acc;
        }, { admins: [], managers: [], supervisors: [] });

        // Send grouped users to the frontend
        res.status(200).json(groupedUsers);
    } catch (error) {
        console.error('Error fetching users by role:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const deleteUsers = async (req, res) => {
  const { email } = req.params;

  let connection; // Define the connection variable

  try {
    // Step 1: Get a connection from the pool
    connection = await db.getConnection();

    // Start a transaction
    await connection.beginTransaction();

    // Step 2: Fetch user ID based on email
    const [user] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);

    if (!user || user.length === 0) {
      await connection.rollback();  // Rollback if user not found
      return res.status(404).json({ message: 'User not found' });
    }

    const userId = user.id;

    // Step 3: Delete or update data from related tables

    // Option 1: Delete all assignments related to the user first
        await connection.query('DELETE FROM assignment WHERE managerID = ?', [userId]);
        await connection.query('DELETE FROM assignment WHERE technicianID = ?', [userId]);

       

    // Option 2: If you want to update assignments instead, you could do something like this:
     await connection.query('UPDATE assignment SET managerID = NULL WHERE managerID = ?', [userId]);

    // Delete feedback associated with the user
    await connection.query('DELETE FROM feedback WHERE residentID = ?', [userId]);
    
    // Update issues that were reported or supervised by the user
    await connection.query('UPDATE issue SET residentID = NULL, assignedSupervisorID = NULL WHERE residentID = ? OR assignedSupervisorID = ?', [userId, userId]);
    
    // Delete notifications related to the user
    await connection.query('DELETE FROM notification WHERE userID = ?', [userId]);
    
    // Step 4: Delete the user
    await connection.query('DELETE FROM users WHERE email = ?', [email]);

    // Commit the transaction
    await connection.commit();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    // Rollback the transaction in case of error
    if (connection) await connection.rollback();
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();  // Only call release on a valid connection
  }
};

  
  

const fetchDepartments = async (req, res) => {
    try {
        const [departments] = await db.query('SELECT * FROM department');  // Corrected 'department'
        return res.status(200).json(departments);
    } catch (error) {
        throw error;
    }
}

module.exports = {fetchDepartments, getUsersByRole, updateResidentDetails, updateProfilePicture, deleteUsers,};
