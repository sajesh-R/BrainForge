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

export const downloadSubmission = async (submissionId, fileName) => {
    const response = await apiClient.get(`/assignments/submission/${submissionId}/download`, {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
};
