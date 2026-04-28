import apiClient from '../apiClient';

export const getAllReports = () => apiClient.get('/reports');
export const getEnrollmentReportData = () => apiClient.get('/reports/data/enrollments');
export const getAssignmentReportData = () => apiClient.get('/reports/data/assignments');
