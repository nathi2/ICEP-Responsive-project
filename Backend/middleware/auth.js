const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    // Allow access if user data is provided in the request body instead of a token
    if (!authHeader && req.body.user) {
        req.user = req.body.user; // Assume req.body.user contains the user data
        return next();
    }

    if (!authHeader) return res.status(403).json({ message: 'Access Denied!' });
    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY);
        req.user = verified.user;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
