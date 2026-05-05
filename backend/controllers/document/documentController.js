const documentService = require('../../services/document/documentService');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3 } = require('../../middleware/uploadMiddleware');
const notificationController = require('../notification/notificationController');
const courseService = require('../../services/course/courseService');
const User = require('../../models/auth/User');




// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { courseId } = req.body;
        const userId = req.user?._id || req.body.userId;

        if (!courseId || !userId) {
            return res.status(400).json({ message: 'Course ID and User ID are required' });
        }


        const document = await documentService.saveDocumentReference({
            fileName: req.file.originalname,
            filePath: req.file.location, // S3 URL
            courseId,
            userId,
        });

        // Notify all enrolled students
        try {
            const course = await courseService.fetchCourseById(courseId);
            const enrolledUserIds = await courseService.fetchCourseEnrolledUsers(courseId);
            
            for (const targetUserId of enrolledUserIds) {
                // Don't notify the person who uploaded it (the teacher)
                if (targetUserId.toString() !== userId.toString()) {
                    await notificationController.createNotification(
                        targetUserId,
                        'New Course Material',
                        `A new document "${req.file.originalname}" has been added to ${course.title}.`,
                        'DOCUMENT',
                        `/courses/${courseId}`
                    );

                }
            }
        } catch (error) {
            console.error('Error sending document upload notifications:', error);
        }

        res.status(201).json({
            message: 'Document uploaded successfully',
            document,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};

// @desc    Get documents by Course ID
// @route   GET /api/documents/course/:courseId
// @access  Private
exports.getDocumentsByCourse = async (req, res) => {
    try {
        const documents = await documentService.fetchDocumentsByCourse(req.params.courseId);
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get document by ID (Download/View)
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res) => {
    try {
        const document = await documentService.fetchDocumentById(req.params.id);
        
        // Extract the key from the full S3 URL
        // Example URL: https://bucket.s3.region.amazonaws.com/uploads/file.jpg
        // The key is everything after the bucket domain
        const url = new URL(document.filePath);
        const key = url.pathname.substring(1); // Remove leading slash

        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        });

        // Generate a signed URL that lasts for 1 hour (3600 seconds)
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

        res.redirect(signedUrl);
    } catch (error) {
        console.error('Signed URL Error:', error);
        res.status(error.message === 'Document not found' ? 404 : 500).json({ message: error.message });
    }
};


