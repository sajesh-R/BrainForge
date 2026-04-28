import apiClient from '../apiClient';

export const getCourses = () => apiClient.get('/courses');
export const getEnrolledCourses = () => apiClient.get('/courses/enrolled');
export const getAssignments = () => apiClient.get('/assignments/user');
export const getNotifications = () => apiClient.get('/notifications');
export const markNotificationRead = (id) => apiClient.put(`/notifications/${id}/read`);
export const getRecentMessages = () => apiClient.get('/chat/recent');
export const getTimeline = () => apiClient.get('/smart/timeline');
