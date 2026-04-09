import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const complaintService = {
    // 민원 접수
    createComplaint: (data) => api.post('/complaints/', data),
    
    // 민원 조회
    getComplaint: (id) => api.get(`/complaints/${id}`),
    
    // 민원 목록
    listComplaints: (params = {}) => {
        return api.get('/complaints/', { params });
    },
    
    // 민원 상태 업데이트
    updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
    
    // ===== 공무원 액션 =====
    
    // 민원 답변
    answerComplaint: (id, data) => 
        api.put(`/complaints/${id}/answer`, data),
    
    // 민원 종결
    closeComplaint: (id, data) => 
        api.put(`/complaints/${id}/close`, data),
    
    // 민원 취하
    withdrawComplaint: (id, data) => 
        api.put(`/complaints/${id}/withdraw`, data),
    
    // 민원 이송
    transferComplaint: (id, data) => 
        api.put(`/complaints/${id}/transfer`, data),
    
    // 민원 부서 재지정
    reassignComplaint: (id, data) => 
        api.put(`/complaints/${id}/reassign`, data),
    
    // 재지정 제안 조회
    getReassignSuggestions: (id) => 
        api.post(`/complaints/${id}/reassign-suggestions`),
    
    // 부처별 통계
    getDepartmentStats: (departmentId) => 
        api.get(`/complaints/stats/${departmentId}`)
};

export const classificationService = {
    // 민원 분류
    analyze: (title, content) => 
        api.post('/classification/analyze', { title, content }),
    
    // 배치 분류
    batchClassify: (complaints) =>
        api.post('/classification/batch', { complaints })
};

export const duplicateService = {
    // 중복 검사
    checkDuplicate: (citizenId, title, content) =>
        api.post('/duplicates/check', { citizen_id: citizenId, title, content }),
    
    // 반복민원 알림 목록
    listAlerts: (page = 1, perPage = 10, reviewed = null) => {
        const params = { page, per_page: perPage };
        if (reviewed !== null) params.reviewed = reviewed;
        return api.get('/duplicates/alerts', { params });
    },
    
    // 반복민원 알림 검토 완료
    markAlertReviewed: (alertId) =>
        api.put(`/duplicates/alerts/${alertId}`),
    
    // 중복 통계
    getStats: () => api.get('/duplicates/stats')
};

export const departmentService = {
    // 부처 목록
    listDepartments: () => api.get('/departments/'),
    
    // 부처 생성
    createDepartment: (data) => api.post('/departments/', data),
    
    // 부서 목록
    listSubDepartments: (departmentId = null) => {
        const params = {};
        if (departmentId) params.department_id = departmentId;
        return api.get('/departments/sub-departments', { params });
    },
    
    // 부서 생성
    createSubDepartment: (data) => api.post('/departments/sub-departments', data),
    
    // 샘플 데이터 초기화
    initSampleData: () => api.post('/departments/init-sample-data')
};

export default api;
