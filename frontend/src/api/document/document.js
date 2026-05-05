import apiClient from '../apiClient';

export const uploadDocument = async (formData) => {
    const response = await apiClient.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getDocumentsByCourse = async (courseId) => {
    const response = await apiClient.get(`/documents/course/${courseId}`);
    return response.data;
};

export const downloadDocument = (documentId) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    const token = localStorage.getItem('token');
    window.open(`${baseUrl}/documents/${documentId}?token=${token}`, '_blank');
};


