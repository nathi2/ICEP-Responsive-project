const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./config/db');
const registerRoutes = require('./routes/registerRoutes');
const loginRoutes = require('./routes/loginRoutes');
const issueRoutes = require('./routes/issueRoutes');
const supervisorRoutes = require('./routes/supervisorRoutes');
const updateRoutes = require('./routes/updateRoutes');
const issuesRoutes = require('./routes/issueRoutes');
const cors = require('cors');
const updateDetailsRoutes = require('./routes/updateRoutes');
const communicationRoutes = require('./routes/communicationRoutes');
const notificationRoutes = require('./routes/communicationRoutes');

require('dotenv').config();
const path = require('path');

app.use('/api/updateDetails', updateDetailsRoutes);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
    origin: ['http://localhost:3000', 'http://192.168.137.249:3000'],
    credentials: true,
};

app.use('/issues', issuesRoutes);
app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profilePictures', express.static(path.join(__dirname, 'uploads/profilePictures')));
app.use('/api/auth/register', registerRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/issue', issueRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api', communicationRoutes);

app.use('/api/notifications', communicationRoutes);

const PORT = process.env.PORT || 5000;

db.query('SELECT 1')
    .then(() => {
        console.log('Database connected..');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(error => console.log('Failed to connect to database.\n' + error.message));
