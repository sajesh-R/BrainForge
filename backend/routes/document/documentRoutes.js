const express = require('express');
const router = express.Router();
const {
    uploadDocument,
    getDocumentsByCourse,
    getDocumentById,
} = require('../../controllers/document/documentController');
const upload = require('../../middleware/uploadMiddleware');

const { protect } = require('../../middleware/authMiddleware');

// Route for uploading a document
router.post('/upload', protect, upload.single('file'), uploadDocument);

// Route for getting documents by course ID
router.get('/course/:courseId', protect, getDocumentsByCourse);

// Route for getting a document by ID (Download/View)
router.get('/:id', protect, getDocumentById);

module.exports = router;
