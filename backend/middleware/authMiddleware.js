const jwt = require('jsonwebtoken');
const User = require('../models/auth/User');

const protect = async (req, res, next) => {
    let token;

    // 1. Check for token in Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // 2. Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach user to request (excluding password)
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
};

const optionalProtect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        next();
    }
};

module.exports = { protect, admin, optionalProtect };
