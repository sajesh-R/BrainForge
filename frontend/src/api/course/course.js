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

export const enrollInCourse = async (enrollmentData) => {
    const response = await apiClient.post('/courses/enroll', enrollmentData);
    return response.data;
};
