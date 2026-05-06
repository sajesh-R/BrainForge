import apiClient from '../apiClient';

export const sendMessage = async (formData) => {
    const response = await apiClient.post('/chat/send', formData);
    return response.data;
};

export const getUsers = async () => {
    const response = await apiClient.get('/chat/users');
    return response.data;
};

export const startChat = async (receiverId) => {
    const response = await apiClient.post('/chat/start', { receiverId });
    return response.data;
};

export const getUserChats = async () => {
    const response = await apiClient.get('/chat/sessions');
    return response.data;
};

export const getDirectMessages = async (chatId) => {
    const response = await apiClient.get(`/chat/direct/${chatId}`);
    return response.data;
};

export const createGroup = async (groupData) => {
    const response = await apiClient.post('/chat/groups', groupData);
    return response.data;
};

export const getUserGroups = async () => {
    const response = await apiClient.get('/chat/groups');
    return response.data;
};

export const getGroupMessages = async (groupId) => {
    const response = await apiClient.get(`/chat/groups/${groupId}/messages`);
    return response.data;
};

export const markAsRead = async (chatId, groupId) => {
    const response = await apiClient.put('/chat/read', { chatId, groupId });
    return response.data;
};

export const addGroupMember = async (groupId, memberIds) => {
    const response = await apiClient.post(`/chat/groups/${groupId}/members`, { memberIds });
    return response.data;
};

export const removeGroupMember = async (groupId, userId) => {
    const response = await apiClient.delete(`/chat/groups/${groupId}/members/${userId}`);
    return response.data;
};

export const deleteGroup = async (groupId) => {
    const response = await apiClient.delete(`/chat/groups/${groupId}`);
    return response.data;
};
