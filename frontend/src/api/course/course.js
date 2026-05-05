import apiClient from '../apiClient';

export const createCourse = async (courseData) => {
    const response = await apiClient.post('/courses', courseData);
    return response.data;
};

export const getAllCourses = async () => {
    const response = await apiClient.get('/courses');
    return response.data;
};

export const getCourseById = async (id) => {
    const response = await apiClient.get(`/courses/${id}`);
    return response.data;
};

export const enrollInCourse = async (courseId) => {
    const response = await apiClient.post('/courses/enroll', { courseId });
    return response.data;
};

export const getEnrolledCourses = async () => {
    const response = await apiClient.get('/courses/enrolled');
    return response.data;
};

export const addCourseVideo = async (courseId, videoUrl) => {
    const response = await apiClient.put(`/courses/${courseId}/video`, { videoUrl });
    return response.data;
};
