import axios from 'axios';
import { getLocalRecommendation } from './localRecommendation';

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

const normalizeClassificationResponse = (payload, title, content) => {
  const local = getLocalRecommendation(title, content);
  const hasDepartment = Boolean(payload?.department);
  const hasSubDepartment = Boolean(payload?.sub_department);
  const hasReason = Boolean(payload?.classification_basis?.reason);

  if (!hasDepartment || !hasSubDepartment || !hasReason) {
    return {
      ...local,
      ...payload,
      department: payload?.department || local.department,
      sub_department: payload?.sub_department || local.sub_department,
      confidence: payload?.confidence?.overall
        ? payload.confidence
        : local.confidence,
      classification_basis: {
        ...local.classification_basis,
        ...(payload?.classification_basis || {}),
        reason: payload?.classification_basis?.reason || local.classification_basis.reason,
      },
      fallback_local: true,
    };
  }

  return payload;
};

export const complaintService = {
  createComplaint: async (data) => {
    try {
      return await api.post('/complaints/', data);
    } catch (error) {
      if (error?.response?.status !== 405) throw error;
    }

    // Fallback for strict-slash/proxy environments.
    return api.post('/complaints', data);
  },
  getComplaint: (id) => api.get(`/complaints/${id}`),
  listComplaints: (params = {}) => api.get('/complaints/', { params }),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
  answerComplaint: (id, data) => api.put(`/complaints/${id}/answer`, data),
  getAiAnswerSuggestion: (id) => api.get(`/complaints/${id}/ai-answer-suggestion`),
  closeComplaint: (id, data) => api.put(`/complaints/${id}/close`, data),
  withdrawComplaint: (id, data) => api.put(`/complaints/${id}/withdraw`, data),
  transferComplaint: (id, data) => api.put(`/complaints/${id}/transfer`, data),
  reassignComplaint: (id, data) => api.put(`/complaints/${id}/reassign`, data),
  getReassignSuggestions: (id) => api.post(`/complaints/${id}/reassign-suggestions`),
  getDepartmentStats: (departmentId) => api.get(`/complaints/stats/${departmentId}`),
};

export const classificationService = {
  analyze: async (title, content) => {
    // Fallback chain for environments that can return 405
    // due to path/method handling differences.
    try {
      const res = await api.post('/classification/analyze', { title, content });
      return { ...res, data: normalizeClassificationResponse(res.data, title, content) };
    } catch (error) {
      if (error?.response?.status !== 405) throw error;
    }

    try {
      const res = await api.post('/classification/analyze/', { title, content });
      return { ...res, data: normalizeClassificationResponse(res.data, title, content) };
    } catch (error) {
      if (error?.response?.status !== 405) throw error;
    }

    // Last fallback: GET query style
    try {
      const res = await api.get('/classification/analyze', { params: { title, content } });
      return { ...res, data: normalizeClassificationResponse(res.data, title, content) };
    } catch (error) {
      // Final fallback: local rule-based recommendation.
      // This guarantees 추천 부처/부서 화면 is still renderable.
      return { data: getLocalRecommendation(title, content) };
    }
  },
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
  initSampleData: (force = false) =>
    api.post(`/departments/init-sample-data${force ? '?force=true' : ''}`),
};

export default api;
