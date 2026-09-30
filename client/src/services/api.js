import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/password', data),
};

// Students
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Teachers
export const teacherAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getOne: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

// Subjects
export const subjectAPI = {
  getAll: (params) => api.get('/subjects', { params }),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Attendance
export const attendanceAPI = {
  startSession: (data) => api.post('/attendance/start-session', data),
  endSession: (sessionId) => api.put(`/attendance/end-session/${sessionId}`),
  mark: (data) => api.post('/attendance/mark', data),
  getAll: (params) => api.get('/attendance', { params }),
  getStudentAttendance: (id) => api.get(`/attendance/student/${id}`),
  getSubjectAttendance: (id) => api.get(`/attendance/subject/${id}`),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  getSessions: (params) => api.get('/attendance/sessions', { params }),
};

// AI
export const aiAPI = {
  registerFace: (data) => api.post('/ai/register-face', data),
  recognizeFace: (data) => api.post('/ai/recognize-face', data),
};

// Analytics
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getStudentAnalytics: (id) => api.get(`/analytics/student/${id}`),
  getSubjectAnalytics: (id) => api.get(`/analytics/subject/${id}`),
  getInsights: () => api.get('/analytics/insights'),
};

// Reports
export const reportAPI = {
  getReport: (params) => api.get('/reports/attendance', { params }),
  exportCSV: (params) => api.get('/reports/attendance/csv', { params, responseType: 'blob' }),
  exportPDF: (params) => api.get('/reports/attendance/pdf', { params, responseType: 'blob' }),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
