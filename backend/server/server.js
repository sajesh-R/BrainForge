require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('../config/db');
const authRoutes = require('../routes/auth/authRoutes');
const userRoutes = require('../routes/auth/userRoutes');
const courseRoutes = require('../routes/course/courseRoutes');
const documentRoutes = require('../routes/document/documentRoutes');
const chatRoutes = require('../routes/chat/chatRoutes');
const assignmentRoutes = require('../routes/assignment/assignmentRoutes');
const smartRoutes = require('../routes/smart/smartRoutes');
const notificationRoutes = require('../routes/notification/notificationRoutes');
const reportRoutes = require('../routes/report/reportRoutes');
const path = require('path');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/smart', smartRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
