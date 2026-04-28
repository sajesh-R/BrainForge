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

export const downloadDocument = async (documentId, fileName) => {
    const response = await apiClient.get(`/documents/${documentId}`, {
        responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
