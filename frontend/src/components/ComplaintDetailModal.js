import React, { useState } from 'react';
import { complaintService } from '../services/api';
import { getLocalRecommendation, LEGAL_RULES } from '../services/localRecommendation';
import './ComplaintDetailModal.css';

export const ComplaintDetailModal = ({ complaint, onClose }) => {
  const LOCAL_FALLBACK_COMPLAINTS_KEY = 'local_fallback_complaints';
  const isLocalFallback = Boolean(complaint?.local_fallback) || String(complaint?.id || '').startsWith('local-');
  const [activeAction, setActiveAction] = useState(null);
  const [actionData, setActionData] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
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
      if (isLocalFallback) {
        const localRec = getLocalRecommendation(complaint.title, complaint.content);
        const suggestions = [
          {
            rank: 1,
            department_name: localRec.department,
            sub_department_name: localRec.sub_department,
            confidence: localRec.confidence?.overall || 0.5,
            reason: localRec.classification_basis?.reason || '로컬 규칙 기반 추천',
          },
        ];

        let deptId = 1;
        const available_departments = Object.entries(LEGAL_RULES).map(([deptName, deptMeta]) => {
          const currentDeptId = deptId++;
          let subId = 1;
          return {
            id: currentDeptId,
            name: deptName,
            sub_departments: Object.keys(deptMeta.subDepartments).map((subName) => ({
              id: subId++,
              name: subName,
              keywords: '',
            })),
          };
        });

        setReassignSuggestions({
          suggestions,
          available_departments,
          current_department: complaint.department || '-',
          current_sub_department: complaint.sub_department || '-',
        });
        setActiveAction('reassign');
        return;
      }

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

  const updateLocalFallbackComplaint = (patch) => {
    try {
      const raw = window.localStorage.getItem(LOCAL_FALLBACK_COMPLAINTS_KEY);
      const items = raw ? JSON.parse(raw) : [];
      const updated = items.map((item) =>
        item.complaint_id === complaint.complaint_id
          ? { ...item, ...patch, updated_at: new Date().toISOString() }
          : item
      );
      window.localStorage.setItem(LOCAL_FALLBACK_COMPLAINTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const buildLocalAiAnswer = () => {
    const rec = getLocalRecommendation(complaint.title, complaint.content);
    return (
      "안녕하세요. 접수하신 민원에 대해 검토 결과를 안내드립니다.\n\n" +
      `1. 민원 요지\n- ${complaint.title}\n- ${(complaint.content || '').slice(0, 180)}${(complaint.content || '').length > 180 ? '...' : ''}\n\n` +
      `2. 검토 부서(추천)\n- ${rec.department} ${rec.sub_department}\n\n` +
      "3. 처리 안내\n- 사실관계를 확인한 뒤 관련 기준에 따라 처리하겠습니다.\n" +
      "- 소관이 다른 경우 관계기관 이송 또는 협조 요청 후 진행상황을 안내드리겠습니다.\n\n" +
      "감사합니다."
    );
  };

  const handleAnswerClick = async () => {
    setActiveAction('answer');
    if (actionData.response_content) return;

    if (isLocalFallback) {
      const suggestion = buildLocalAiAnswer();
      setActionData((prev) => ({ ...prev, response_content: suggestion }));
      setMessage({ type: 'success', text: 'AI 추천답변을 생성했습니다. 필요시 수정 후 저장하세요.' });
      return;
    }

    setAiLoading(true);
    try {
      const res = await complaintService.getAiAnswerSuggestion(complaint.id);
      const suggestion = res?.data?.suggested_answer || '';
      const basis = (res?.data?.basis || []).join('\n- ');
      const withBasis = basis ? `${suggestion}\n\n[근거]\n- ${basis}` : suggestion;
      setActionData((prev) => ({ ...prev, response_content: withBasis }));
      setMessage({ type: 'success', text: 'AI 추천답변을 불러왔습니다. 필요시 수정 후 저장하세요.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || error.message });
    } finally {
      setAiLoading(false);
    }
  };

  const handleLocalAnswerSave = () => {
    if (!actionData.response_content) {
      setMessage({ type: 'error', text: '답변 내용을 입력해 주세요.' });
      return;
    }
    updateLocalFallbackComplaint({
      response_content: actionData.response_content,
      response_date: new Date().toISOString(),
      handler_id: 'admin',
      status: '답변완료',
    });
    setMessage({ type: 'success', text: '임시 접수 건 답변이 저장되었습니다.' });
    setTimeout(() => onClose(), 800);
  };

  const handleLocalTransfer = () => {
    if (!actionData.target_department) {
      setMessage({ type: 'error', text: '이송 대상 부처를 입력해 주세요.' });
      return;
    }
    updateLocalFallbackComplaint({
      status: '이송',
      department: actionData.target_department,
    });
    setMessage({ type: 'success', text: '임시 접수 건 이송 처리 완료' });
    setTimeout(() => onClose(), 800);
  };

  const handleLocalReassign = () => {
    if (!actionData.target_department_name || !actionData.target_sub_department_name) {
      setMessage({ type: 'error', text: '재지정 대상 부처/부서를 선택해 주세요.' });
      return;
    }
    updateLocalFallbackComplaint({
      status: '분류완료',
      department: actionData.target_department_name,
      sub_department: actionData.target_sub_department_name,
    });
    setMessage({ type: 'success', text: '임시 접수 건 재지정 완료' });
    setTimeout(() => onClose(), 800);
  };

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
              <button className="action-btn answer-btn" onClick={handleAnswerClick}>답변</button>
              <button className="action-btn close-btn-action" onClick={() => executeAction(complaintService.closeComplaint, { handler_id: 'admin' }, '종결 처리 완료')} disabled={isLocalFallback}>종결</button>
              <button className="action-btn withdraw-btn" onClick={() => executeAction(complaintService.withdrawComplaint, { handler_id: 'admin' }, '취하 처리 완료')} disabled={isLocalFallback}>취하</button>
              <button
                className="action-btn transfer-btn"
                onClick={() => {
                  if (isLocalFallback) {
                    const rec = getLocalRecommendation(complaint.title, complaint.content);
                    setActionData((prev) => ({ ...prev, target_department: rec.department }));
                  }
                  setActiveAction('transfer');
                }}
              >
                이송
              </button>
              <button className="action-btn reassign-btn" onClick={handleReassignClick}>재지정</button>
            </div>
          </div>
        )}

        {activeAction === 'answer' && (
          <div className="action-modal">
            <h4>민원 답변</h4>
            <div className="action-buttons" style={{ marginBottom: 10 }}>
              <button disabled={aiLoading || loading} onClick={handleAnswerClick}>
                {aiLoading ? 'AI 작성중...' : 'AI 추천답변 생성'}
              </button>
            </div>
            <textarea rows="5" value={actionData.response_content || ''} onChange={(e) => setActionData({ ...actionData, response_content: e.target.value })} />
            <div className="action-buttons">
              <button
                disabled={loading}
                onClick={() =>
                  isLocalFallback
                    ? handleLocalAnswerSave()
                    : executeAction(
                        complaintService.answerComplaint,
                        { handler_id: 'admin', response_content: actionData.response_content || '' },
                        '답변 완료'
                      )
                }
              >
                저장
              </button>
              <button onClick={() => setActiveAction(null)}>취소</button>
            </div>
          </div>
        )}

        {activeAction === 'transfer' && (
          <div className="action-modal">
            <h4>민원 이송</h4>
            {isLocalFallback && (
              <div className="suggestion-item">
                추천 부서: {getLocalRecommendation(complaint.title, complaint.content).department} &gt;{' '}
                {getLocalRecommendation(complaint.title, complaint.content).sub_department}
              </div>
            )}
            <input type="text" value={actionData.target_department || ''} onChange={(e) => setActionData({ ...actionData, target_department: e.target.value })} placeholder="이송 대상 부처" />
            <div className="action-buttons">
              <button
                disabled={loading}
                onClick={() =>
                  isLocalFallback
                    ? handleLocalTransfer()
                    : executeAction(
                        complaintService.transferComplaint,
                        { handler_id: 'admin', target_department: actionData.target_department || '' },
                        '이송 완료'
                      )
                }
              >
                이송
              </button>
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
                const selectedDept = (reassignSuggestions?.available_departments || []).find(
                  (d) => Number(d.id) === Number(departmentId)
                );
                const selectedSub = (selectedDept?.sub_departments || []).find(
                  (s) => Number(s.id) === Number(subDepartmentId)
                );
                setActionData({
                  ...actionData,
                  target_department_id: Number(departmentId),
                  target_sub_department_id: Number(subDepartmentId),
                  target_department_name: selectedDept?.name || '',
                  target_sub_department_name: selectedSub?.name || '',
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
                  isLocalFallback
                    ? handleLocalReassign()
                    : executeAction(
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
