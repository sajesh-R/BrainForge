import apiClient from '../apiClient';

export const getTimeline = () => apiClient.get('/smart/timeline');
export const getLeaderboard = () => apiClient.get('/smart/leaderboard');
export const getReminders = () => apiClient.get('/smart/reminders');
export const getAtRiskUsers = () => apiClient.get('/smart/at-risk');
export const askAssistant = (query) => apiClient.post('/smart/assistant', { query });
export const getTaggedDocuments = () => apiClient.get('/smart/tagged-docs');
export const getUserProfile = () => apiClient.get('/user/profile');
