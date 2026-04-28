const Document = require('../../models/document/Document');
const SmartFeaturesService = require('../smart/smartFeaturesService');

exports.saveDocumentReference = async (documentData) => {
    const { fileName, filePath, courseId, userId } = documentData;

    const document = await Document.create({
        fileName,
        filePath,
        courseId,
        userId,
    });

    await SmartFeaturesService.logActivity(userId, 'UPLOAD', `Uploaded document: ${fileName}`, 20);
    await SmartFeaturesService.tagDocument(document._id);

    return document;
};

exports.fetchDocumentsByCourse = async (courseId) => {
    return await Document.find({ courseId }).populate('userId', 'name email');
};

exports.fetchDocumentById = async (id) => {
    const document = await Document.findById(id);
    if (!document) {
        throw new Error('Document not found');
    }
    return document;
};
