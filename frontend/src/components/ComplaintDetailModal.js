import React, { useState } from 'react';
import { complaintService } from '../services/api';
import './ComplaintDetailModal.css';

export const ComplaintDetailModal = ({ complaint, onClose }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [actionData, setActionData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [reassignSuggestions, setReassignSuggestions] = useState(null);

  const executeAction = async (fn, payload, successText) => {
    setLoading(true);
    setMessage(null);
    try {
      await fn(complaint.id, payload);
      setMessage({ type: 'success', text: successText });
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReassignClick = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getReassignSuggestions(complaint.id);
      setReassignSuggestions(res.data);
      setActiveAction('reassign');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleString('ko-KR') : '-');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>민원 상세정보</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>

        {message && <div className={`message message-${message.type}`}>{message.text}</div>}

        <div className="modal-body">
          <section className="info-section">
            <h3>기본정보</h3>
            <div className="info-grid">
              <div className="info-item"><label>민원번호:</label><span>{complaint.complaint_id}</span></div>
              <div className="info-item"><label>요청자:</label><span>{complaint.citizen_name}</span></div>
              <div className="info-item"><label>접수일:</label><span>{formatDate(complaint.received_date)}</span></div>
              <div className="info-item"><label>상태:</label><span className={`status-badge status-${complaint.status}`}>{complaint.status}</span></div>
              <div className="info-item"><label>처리기한:</label><span>{complaint.remaining_days === null ? '-' : `${complaint.remaining_days}일`}</span></div>
            </div>
          </section>

          <section className="content-section">
            <h3>민원 내용</h3>
            <div className="content-item"><label>제목:</label><div className="content-value title">{complaint.title}</div></div>
            <div className="content-item"><label>내용:</label><div className="content-value">{complaint.content}</div></div>
            <div className="content-item"><label>요약:</label><div className="summary-content">{complaint.content_summary || '-'}</div></div>
          </section>

          <section className="classification-section">
            <h3>분류 정보</h3>
            <div className="classification-info">
              <div className="info-item"><label>부처</label><span>{complaint.department || '-'}</span></div>
              <div className="info-item"><label>부서</label><span>{complaint.sub_department || '-'}</span></div>
              <div className="info-item"><label>신뢰도</label><span>{complaint.classification_score ? `${(complaint.classification_score * 100).toFixed(1)}%` : '-'}</span></div>
            </div>
          </section>
        </div>

        {activeAction === null && (
          <div className="modal-footer">
            <div className="action-buttons">
              <button className="action-btn answer-btn" onClick={() => setActiveAction('answer')}>답변</button>
              <button className="action-btn close-btn-action" onClick={() => executeAction(complaintService.closeComplaint, { handler_id: 'admin' }, '종결 처리 완료')}>종결</button>
              <button className="action-btn withdraw-btn" onClick={() => executeAction(complaintService.withdrawComplaint, { handler_id: 'admin' }, '취하 처리 완료')}>취하</button>
              <button className="action-btn transfer-btn" onClick={() => setActiveAction('transfer')}>이송</button>
              <button className="action-btn reassign-btn" onClick={handleReassignClick}>재지정</button>
            </div>
          </div>
        )}

        {activeAction === 'answer' && (
          <div className="action-modal">
            <h4>민원 답변</h4>
            <textarea rows="5" value={actionData.response_content || ''} onChange={(e) => setActionData({ ...actionData, response_content: e.target.value })} />
            <div className="action-buttons">
              <button disabled={loading} onClick={() => executeAction(complaintService.answerComplaint, { handler_id: 'admin', response_content: actionData.response_content || '' }, '답변 완료')}>저장</button>
              <button onClick={() => setActiveAction(null)}>취소</button>
            </div>
          </div>
        )}

        {activeAction === 'transfer' && (
          <div className="action-modal">
            <h4>민원 이송</h4>
            <input type="text" value={actionData.target_department || ''} onChange={(e) => setActionData({ ...actionData, target_department: e.target.value })} placeholder="이송 대상 부처" />
            <div className="action-buttons">
              <button disabled={loading} onClick={() => executeAction(complaintService.transferComplaint, { handler_id: 'admin', target_department: actionData.target_department || '' }, '이송 완료')}>이송</button>
              <button onClick={() => setActiveAction(null)}>취소</button>
            </div>
          </div>
        )}

        {activeAction === 'reassign' && (
          <div className="action-modal reassign-modal">
            <h4>민원 재지정</h4>
            <select
              onChange={(e) => {
                const [departmentId, subDepartmentId] = e.target.value.split(':');
                setActionData({
                  ...actionData,
                  target_department_id: Number(departmentId),
                  target_sub_department_id: Number(subDepartmentId),
                });
              }}
            >
              <option value="">부처/부서 선택</option>
              {(reassignSuggestions?.available_departments || []).flatMap((dept) =>
                (dept.sub_departments || []).map((sub) => (
                  <option key={`${dept.id}:${sub.id}`} value={`${dept.id}:${sub.id}`}>
                    {dept.name} &gt; {sub.name}
                  </option>
                ))
              )}
            </select>
            <div className="action-buttons">
              <button
                disabled={loading || !actionData.target_department_id || !actionData.target_sub_department_id}
                onClick={() =>
                  executeAction(
                    complaintService.reassignComplaint,
                    {
                      handler_id: 'admin',
                      target_department_id: actionData.target_department_id,
                      target_sub_department_id: actionData.target_sub_department_id,
                    },
                    '재지정 완료'
                  )
                }
              >
                재지정
              </button>
              <button onClick={() => setActiveAction(null)}>취소</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
