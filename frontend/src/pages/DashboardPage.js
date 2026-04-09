import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { complaintService, departmentService } from '../services/api';
import './DashboardPage.css';

export const DashboardPage = () => {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const targetComplaintId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const value = Number(params.get('complaintId') || 0);
    return Number.isFinite(value) ? value : 0;
  }, [location.search]);

  const fetchComplaints = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = { page, per_page: 10 };
        if (selectedDepartment) params.department_id = Number(selectedDepartment);
        if (statusFilter) params.status = statusFilter;

        const res = await complaintService.listComplaints(params);
        setComplaints(res.data.complaints || []);
        setTotalPages(res.data.pages || 1);
        setCurrentPage(page);
      } finally {
        setLoading(false);
      }
    },
    [selectedDepartment, statusFilter]
  );

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.listDepartments();
      setDepartments(res.data.departments || []);
    } catch {
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchComplaints(1);
  }, [fetchComplaints]);

  useEffect(() => {
    if (!targetComplaintId) return;

    complaintService
      .getComplaint(targetComplaintId)
      .then((res) => setSelectedComplaint(res.data))
      .catch(() => {
        // ignore invalid query id
      });
  }, [targetComplaintId]);

  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const statusOptions = ['접수', '분류완료', '처리중', '답변완료', '종결', '취하', '이송', '반복민원알림'];

  return (
    <div className="dashboard-page">
      <Header title="공무원용" description="접수된 민원을 조회하고 처리합니다" />

      <div className="container">
        <div className="filter-section">
          <div className="filter-group">
            <label>부처</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
              <option value="">전체</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>상태</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">전체</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="complaints-section">
          <h2>민원 목록</h2>
          {loading ? (
            <div className="loading">로딩 중...</div>
          ) : complaints.length === 0 ? (
            <div className="no-data">조회된 민원이 없습니다.</div>
          ) : (
            <>
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>요청일</th>
                    <th>접수일</th>
                    <th>제목</th>
                    <th>요청자</th>
                    <th>남은일</th>
                    <th>상태</th>
                    <th>반복</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id} className={targetComplaintId === c.id ? 'target-row' : ''}>
                      <td>{formatDate(c.created_at)}</td>
                      <td>{formatDate(c.received_date)}</td>
                      <td className="title-cell" onClick={() => complaintService.getComplaint(c.id).then((r) => setSelectedComplaint(r.data))}>
                        {c.title}
                      </td>
                      <td>{c.citizen_name}</td>
                      <td>{c.remaining_days === null ? '-' : `${c.remaining_days}일`}</td>
                      <td>
                        <span className={`status-badge status-${c.status}`}>{c.status}</span>
                      </td>
                      <td>{c.is_duplicate ? `예 (${c.repeat_count || 0})` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <button onClick={() => fetchComplaints(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                  이전
                </button>
                <span className="page-info">
                  {currentPage} / {totalPages}
                </span>
                <button onClick={() => fetchComplaints(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                  다음
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedComplaint && (
        <ComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => {
            setSelectedComplaint(null);
            fetchComplaints(currentPage);
          }}
        />
      )}
    </div>
  );
};
