const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');

// GET /api/user/profile  – protected route (requires valid JWT)
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        message: 'Authorized',
        user: req.user,
    });
});

module.exports = router;
