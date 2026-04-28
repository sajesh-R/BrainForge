const authService = require('../../services/auth/authService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required: name, email, password, role' });
        }

        if (!['Student', 'Admin'].includes(role)) {
            return res.status(400).json({ message: 'Role must be either Student or Admin' });
        }

        const user = await authService.registerUser(req.body);

        res.status(201).json({
            message: 'User account created successfully',
            user,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required: email, password' });
        }

        const data = await authService.loginUser(email, password);

        res.status(200).json({
            message: 'Login success',
            ...data,
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

module.exports = { register, login };
