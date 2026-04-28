const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/auth/User');

exports.registerUser = async (userData) => {
    let { name, email, password, role } = userData;

    // Clean data
    email = email.trim().toLowerCase();

    // 1. Check for existing user (case-insensitive)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('A user with this email already exists');
    }

    // 2. Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Store user in database
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
};

exports.loginUser = async (email, password) => {
    // 1. Fetch user from database
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // 2. Compare encrypted password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // 3. Generate JWT token
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};
