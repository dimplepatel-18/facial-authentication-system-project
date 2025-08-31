const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization'); // Token from headers

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, 'your_secret_key'); // Replace with env variable
        req.user = verified; // Store user info in request
        next(); // Continue to the next middleware
    } catch (error) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};
