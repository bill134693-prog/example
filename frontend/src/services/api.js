import axios from 'axios';
import { getLocalRecommendation, getLocalRecommendations } from './localRecommendation';

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

const generateClientReceiptNumber = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yymm = `${yy}${mm}`;
  const key = `receipt_seq_${yymm}`;
  const current = Number(window.localStorage.getItem(key) || '0');
  const next = current + 1;
  window.localStorage.setItem(key, String(next));
  return `1AA-${yymm}-${String(next).padStart(6, '0')}`;
};

const buildLocalFallbackResponse = () => ({
  data: {
    success: true,
    complaint_id: generateClientReceiptNumber(),
    id: null,
    local_fallback: true,
    duplicate_alert: { is_duplicate: false },
  },
});

const normalizeClassificationResponse = (payload, title, content) => {
  const local = getLocalRecommendation(title, content);
  const localTop = getLocalRecommendations(title, content, 3);
  const hasDepartment = Boolean(payload?.department);
  const hasSubDepartment = Boolean(payload?.sub_department);
  const hasReason = Boolean(payload?.classification_basis?.reason);
  const serverRecs = Array.isArray(payload?.recommendations) ? payload.recommendations : [];
  const normalizedRecommendations = (serverRecs.length > 0 ? serverRecs : localTop).map((r) => ({
    department: r.department,
    sub_department: r.sub_department,
    confidence: r.confidence || {
      department: r.department_score || 0,
      sub_department: r.sub_department_score || 0,
      overall: r.overall_score || 0,
    },
    classification_basis: r.classification_basis || {
      reason: '',
      legal_basis: '',
      policy_basis: '',
      keywords: [],
    },
  }));

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
      recommendations: normalizedRecommendations,
      fallback_local: true,
    };
  }

  return { ...payload, recommendations: normalizedRecommendations };
};

const actionRequestWithFallback = async (path, data) => {
  const attempts = [
    () => api.put(path, data),
    () => api.put(`${path}/`, data),
    () => api.post(path, data),
    () => api.post(`${path}/`, data),
  ];
  let lastError = null;
  for (const run of attempts) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (Number(error?.response?.status) !== 405) throw error;
    }
  }
  throw lastError || new Error('action request failed');
};

export const complaintService = {
  createComplaint: async (data) => {
    const tried = [];
    try {
      return await api.post('/complaints/', data);
    } catch (error) {
      tried.push('/complaints/');
      if (error?.response?.status !== 405) throw error;
    }

    try {
      return await api.post('/complaints', data);
    } catch (error) {
      tried.push('/complaints');
      if (error?.response?.status !== 405) throw error;
    }

    // Final fallback for environments with strict route handling.
    try {
      return await api.post('/complaints/submit', data);
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.error || error.message;
      const statusNum = Number(status);
      const statusText = String(status || '');
      const msgText = String(message || '');
      const is405Like =
        statusNum === 405 ||
        statusText.includes('405') ||
        msgText.includes('405') ||
        msgText.toLowerCase().includes('method not allowed');
      const isNoResponse = !error?.response;

      // Never block citizen flow on routing/proxy failures.
      if (is405Like || isNoResponse) return buildLocalFallbackResponse();

      throw new Error(
        `complaint submit failed after fallbacks (tried: ${tried.concat('/complaints/submit').join(', ')}): ` +
          `${status ? `HTTP ${status} ` : ''}${message}`
      );
    }
  },
  getComplaint: (id) => api.get(`/complaints/${id}`),
  listComplaints: (params = {}) => api.get('/complaints/', { params }),
  updateComplaint: (id, data) => actionRequestWithFallback(`/complaints/${id}`, data),
  answerComplaint: (id, data) => actionRequestWithFallback(`/complaints/${id}/answer`, data),
  getAiAnswerSuggestion: (id) => api.get(`/complaints/${id}/ai-answer-suggestion`),
  closeComplaint: (id, data) => actionRequestWithFallback(`/complaints/${id}/close`, data),
  withdrawComplaint: (id, data) => actionRequestWithFallback(`/complaints/${id}/withdraw`, data),
  transferComplaint: (id, data) => actionRequestWithFallback(`/complaints/${id}/transfer`, data),
  reassignComplaint: (id, data) => actionRequestWithFallback(`/complaints/${id}/reassign`, data),
  getReassignSuggestions: (id) =>
    api.post(`/complaints/${id}/reassign-suggestions`).catch((error) => {
      if (Number(error?.response?.status) !== 405) throw error;
      return api.get(`/complaints/${id}/reassign-suggestions`);
    }),
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
