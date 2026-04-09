import axios from 'axios';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const complaintService = {
  createComplaint: (data) => api.post('/complaints/', data),
  getComplaint: (id) => api.get(`/complaints/${id}`),
  listComplaints: (params = {}) => api.get('/complaints/', { params }),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
  answerComplaint: (id, data) => api.put(`/complaints/${id}/answer`, data),
  closeComplaint: (id, data) => api.put(`/complaints/${id}/close`, data),
  withdrawComplaint: (id, data) => api.put(`/complaints/${id}/withdraw`, data),
  transferComplaint: (id, data) => api.put(`/complaints/${id}/transfer`, data),
  reassignComplaint: (id, data) => api.put(`/complaints/${id}/reassign`, data),
  getReassignSuggestions: (id) => api.post(`/complaints/${id}/reassign-suggestions`),
  getDepartmentStats: (departmentId) => api.get(`/complaints/stats/${departmentId}`),
};

export const classificationService = {
  analyze: (title, content) => api.post('/classification/analyze', { title, content }),
  batchClassify: (complaints) => api.post('/classification/batch', { complaints }),
};

export const duplicateService = {
  checkDuplicate: (citizenId, title, content) =>
    api.post('/duplicates/check', { citizen_id: citizenId, title, content }),
  listAlerts: (page = 1, perPage = 10, reviewed = null) => {
    const params = { page, per_page: perPage };
    if (reviewed !== null) params.reviewed = reviewed;
    return api.get('/duplicates/alerts', { params });
  },
  markAlertReviewed: (alertId) => api.put(`/duplicates/alerts/${alertId}`),
  getStats: () => api.get('/duplicates/stats'),
};

export const departmentService = {
  listDepartments: () => api.get('/departments/'),
  createDepartment: (data) => api.post('/departments/', data),
  listSubDepartments: (departmentId = null) => {
    const params = {};
    if (departmentId) params.department_id = departmentId;
    return api.get('/departments/sub-departments', { params });
  },
  createSubDepartment: (data) => api.post('/departments/sub-departments', data),
  initSampleData: () => api.post('/departments/init-sample-data'),
};

export default api;
