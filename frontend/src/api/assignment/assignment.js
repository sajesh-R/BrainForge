import apiClient from '../apiClient';

export const createAssignment = async (assignmentData) => {
    const response = await apiClient.post('/assignments', assignmentData);
    return response.data;
};

export const getAssignmentsByCourse = async (courseId) => {
    const response = await apiClient.get(`/assignments/course/${courseId}`);
    return response.data;
};

export const submitAssignment = async (formData) => {
    const response = await apiClient.post('/assignments/submit', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getSubmissionsForAssignment = async (assignmentId) => {
    const response = await apiClient.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
};

export const downloadSubmission = (submissionId) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    const token = localStorage.getItem('token');
    window.open(`${baseUrl}/assignments/submission/${submissionId}/download?token=${token}`, '_blank');
};


