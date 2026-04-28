const documentService = require('../../services/document/documentService');
const path = require('path');
const fs = require('fs');

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
            // Delete uploaded file if validation fails
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Course ID and User ID are required' });
        }

        const document = await documentService.saveDocumentReference({
            fileName: req.file.originalname,
            filePath: req.file.path,
            courseId,
            userId,
        });

        res.status(201).json({
            message: 'Document uploaded successfully',
            document,
        });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
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

        const filePath = path.resolve(document.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, document.fileName);
    } catch (error) {
        res.status(error.message === 'Document not found' ? 404 : 500).json({ message: error.message });
    }
};
