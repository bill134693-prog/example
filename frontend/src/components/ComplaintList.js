import React, { useState, useEffect } from 'react';
import { complaintService } from '../services/api';
import './ComplaintList.css';

export const ComplaintList = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, [page, status]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const response = await complaintService.listComplaints(page, 10, status);
            setComplaints(response.data.complaints);
            setTotal(response.data.total);
        } catch (error) {
            console.error('민원 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case '접수':
                return '#2196F3';
            case '분류완료':
                return '#4CAF50';
            case '반복민원알림':
                return '#f57c00';
            case '처리':
                return '#9C27B0';
            case '완료':
                return '#666';
            default:
                return '#ccc';
        }
    };

    return (
        <div className="complaint-list">
            <div className="list-header">
                <h2>민원 현황</h2>
                <div className="filter-controls">
                    <select 
                        value={status || ''} 
                        onChange={(e) => {
                            setStatus(e.target.value || null);
                            setPage(1);
                        }}
                    >
                        <option value="">전체 상태</option>
                        <option value="접수">접수</option>
                        <option value="분류완료">분류완료</option>
                        <option value="반복민원알림">반복민원알림</option>
                        <option value="처리">처리</option>
                        <option value="완료">완료</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading">로딩중...</div>
            ) : complaints.length === 0 ? (
                <div className="empty-state">접수된 민원이 없습니다.</div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="complaint-table">
                            <thead>
                                <tr>
                                    <th>민원번호</th>
                                    <th>제목</th>
                                    <th>신청인</th>
                                    <th>부처</th>
                                    <th>부서</th>
                                    <th>상태</th>
                                    <th>접수일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((complaint) => (
                                    <tr key={complaint.id} className="complaint-row">
                                        <td className="complaint-id">{complaint.complaint_id}</td>
                                        <td className="complaint-title">{complaint.title}</td>
                                        <td>{complaint.citizen_name}</td>
                                        <td>{complaint.department || '-'}</td>
                                        <td>{complaint.sub_department || '-'}</td>
                                        <td>
                                            <span 
                                                className="status-badge"
                                                style={{ backgroundColor: getStatusColor(complaint.status) }}
                                            >
                                                {complaint.status}
                                            </span>
                                        </td>
                                        <td className="date">
                                            {new Date(complaint.created_at).toLocaleDateString('ko-KR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            이전
                        </button>
                        <span>{page} / {Math.ceil(total / 10)}</span>
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= Math.ceil(total / 10)}
                        >
                            다음
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
