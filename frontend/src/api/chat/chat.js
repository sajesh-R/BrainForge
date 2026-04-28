import apiClient from '../apiClient';

export const sendMessage = async (formData) => {
    const response = await apiClient.post('/chat/send', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const getMessagesByCourse = async (courseId) => {
    const response = await apiClient.get(`/chat/${courseId}`);
    return response.data;
};
