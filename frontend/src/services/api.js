import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const complaintService = {
    // 誘쇱썝 ?묒닔
    createComplaint: (data) => api.post('/complaints/', data),
    
    // 誘쇱썝 議고쉶
    getComplaint: (id) => api.get(`/complaints/${id}`),
    
    // 誘쇱썝 紐⑸줉
    listComplaints: (params = {}) => {
        return api.get('/complaints/', { params });
    },
    
    // 誘쇱썝 ?곹깭 ?낅뜲?댄듃
    updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
    
    // ===== 怨듬Т???≪뀡 =====
    
    // 誘쇱썝 ?듬?
    answerComplaint: (id, data) => 
        api.put(`/complaints/${id}/answer`, data),
    
    // 誘쇱썝 醫낃껐
    closeComplaint: (id, data) => 
        api.put(`/complaints/${id}/close`, data),
    
    // 誘쇱썝 痍⑦븯
    withdrawComplaint: (id, data) => 
        api.put(`/complaints/${id}/withdraw`, data),
    
    // 誘쇱썝 ?댁넚
    transferComplaint: (id, data) => 
        api.put(`/complaints/${id}/transfer`, data),
    
    // 誘쇱썝 遺???ъ???
    reassignComplaint: (id, data) => 
        api.put(`/complaints/${id}/reassign`, data),
    
    // ?ъ????쒖븞 議고쉶
    getReassignSuggestions: (id) => 
        api.post(`/complaints/${id}/reassign-suggestions`),
    
    // 遺泥섎퀎 ?듦퀎
    getDepartmentStats: (departmentId) => 
        api.get(`/complaints/stats/${departmentId}`)
};

export const classificationService = {
    // 誘쇱썝 遺꾨쪟
    analyze: (title, content) => 
        api.post('/classification/analyze', { title, content }),
    
    // 諛곗튂 遺꾨쪟
    batchClassify: (complaints) =>
        api.post('/classification/batch', { complaints })
};

export const duplicateService = {
    // 以묐났 寃??
    checkDuplicate: (citizenId, title, content) =>
        api.post('/duplicates/check', { citizen_id: citizenId, title, content }),
    
    // 諛섎났誘쇱썝 ?뚮┝ 紐⑸줉
    listAlerts: (page = 1, perPage = 10, reviewed = null) => {
        const params = { page, per_page: perPage };
        if (reviewed !== null) params.reviewed = reviewed;
        return api.get('/duplicates/alerts', { params });
    },
    
    // 諛섎났誘쇱썝 ?뚮┝ 寃???꾨즺
    markAlertReviewed: (alertId) =>
        api.put(`/duplicates/alerts/${alertId}`),
    
    // 以묐났 ?듦퀎
    getStats: () => api.get('/duplicates/stats')
};

export const departmentService = {
    // 遺泥?紐⑸줉
    listDepartments: () => api.get('/departments/'),
    
    // 遺泥??앹꽦
    createDepartment: (data) => api.post('/departments/', data),
    
    // 遺??紐⑸줉
    listSubDepartments: (departmentId = null) => {
        const params = {};
        if (departmentId) params.department_id = departmentId;
        return api.get('/departments/sub-departments', { params });
    },
    
    // 遺???앹꽦
    createSubDepartment: (data) => api.post('/departments/sub-departments', data),
    
    // ?섑뵆 ?곗씠??珥덇린??
    initSampleData: () => api.post('/departments/init-sample-data')
};

export default api;
