import React, { useState } from 'react';
import { complaintService } from '../services/api';
import {
  getLocalRecommendation,
  getLocalRecommendations,
  LEGAL_RULES,
  estimateComplaintDueBusinessDays,
} from '../services/localRecommendation';
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
  const [editingType, setEditingType] = useState(false);
  const [complaintType, setComplaintType] = useState(complaint?.complaint_type || '기타민원');
  const complaintTypeOptions = ['법령질의/건의민원', '일반질의', '고충민원', '기타민원'];

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
        const localRecs = getLocalRecommendations(complaint.title, complaint.content, 3);
        const suggestions = localRecs.map((rec, idx) => ({
          rank: idx + 1,
          department_name: rec.department,
          sub_department_name: rec.sub_department,
          confidence: rec.confidence?.overall || 0.5,
          reason: rec.classification_basis?.reason || '로컬 규칙 기반 추천',
        }));

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
      // Fallback: even if backend suggestion API fails, show local top-3 recommendations.
      const localRecs = getLocalRecommendations(complaint.title, complaint.content, 3);
      const suggestions = localRecs.map((rec, idx) => ({
        rank: idx + 1,
        department_name: rec.department,
        sub_department_name: rec.sub_department,
        confidence: rec.confidence?.overall || 0.5,
        reason: rec.classification_basis?.reason || '로컬 규칙 기반 추천',
      }));

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
      setMessage({ type: 'info', text: '재지정 추천 API 연결이 불안정하여 로컬 추천을 표시합니다.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleString('ko-KR') : '-');

  const addBusinessDaysLite = (date, days) => {
    const d = new Date(date);
    let remain = Number(days || 0);
    while (remain > 0) {
      d.setDate(d.getDate() + 1);
      const wd = d.getDay();
      if (wd === 0 || wd === 6) continue;
      remain -= 1;
    }
    return d;
  };

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
    const complaintNo = complaint.complaint_id || '1AA-0000-000000';
    const summary = (complaint.content || '').replace(/\s+/g, ' ').trim();
    const shortSummary = summary.slice(0, 90) + (summary.length > 90 ? '...' : '');
    return (
      `1. 안녕하십니까? 귀하께서 국민신문고를 통해 신청하신 민원(신청번호 ${complaintNo})에 대한 검토 결과를 다음과 같이 알려드립니다.\n\n` +
      `2. 귀하께서 제출하신 민원의 내용은 "${shortSummary}"에 관한 것으로 이해(또는 판단) 됩니다.\n\n` +
      "3. 귀하의 민원에 대한 검토 결과는 다음과 같습니다.\n" +
      `   가. 본 건은 ${rec.department} ${rec.sub_department} 소관으로 우선 검토하였습니다.\n` +
      "   나. 관련 기준에 따라 사실관계를 확인하고, 필요 시 이송·재지정 등 후속 조치를 진행하겠습니다.\n\n" +
      "4. 답변 내용에 대한 추가 설명이 필요한 경우 소관 부서 담당자에게 연락주시면 친절히 안내해 드리도록 하겠습니다. 감사합니다."
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

  const handleUpdateComplaintType = async () => {
    if (!complaintType) return;
    if (isLocalFallback) {
      const estimated = estimateComplaintDueBusinessDays(complaint.title, complaint.content);
      const days = complaintType === estimated.type ? estimated.days : complaintType === '법령질의/건의민원' ? 14 : 7;
      const dueDate = addBusinessDaysLite(new Date(), days).toISOString();
      updateLocalFallbackComplaint({
        complaint_type: complaintType,
        due_date: dueDate,
        remaining_days: days,
      });
      setMessage({ type: 'success', text: `민원종류가 '${complaintType}'로 수정되었고 처리기한이 자동 조정되었습니다.` });
      setEditingType(false);
      return;
    }

    setLoading(true);
    try {
      const res = await complaintService.updateComplaintType(complaint.id, {
        complaint_type: complaintType,
        handler_id: 'admin',
      });
      complaint.complaint_type = res?.data?.complaint_type || complaintType;
      complaint.due_date = res?.data?.due_date || complaint.due_date;
      complaint.remaining_days = res?.data?.remaining_days ?? complaint.remaining_days;
      setMessage({ type: 'success', text: '민원종류 및 처리기한이 수정되었습니다.' });
      setEditingType(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
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
              <div className="info-item">
                <label>민원종류:</label>
                <span>
                  {editingType ? (
                    <>
                      <select value={complaintType} onChange={(e) => setComplaintType(e.target.value)}>
                        {complaintTypeOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>{' '}
                      <button onClick={handleUpdateComplaintType} disabled={loading}>저장</button>{' '}
                      <button onClick={() => setEditingType(false)} disabled={loading}>취소</button>
                    </>
                  ) : (
                    <>
                      {complaint.complaint_type || '기타민원'}{' '}
                      <button onClick={() => setEditingType(true)}>[수정]</button>
                    </>
                  )}
                </span>
              </div>
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
            <div className="suggestion-item">
              {(isLocalFallback
                ? getLocalRecommendations(complaint.title, complaint.content, 3).map((r, i) => (
                    <div key={`${r.department}-${r.sub_department}-${i}`}>
                      {i + 1}순위 추천: {r.department} &gt; {r.sub_department}
                    </div>
                  ))
                : [
                    <div key="default">
                      추천: {complaint.department || '-'} &gt; {complaint.sub_department || '-'}
                    </div>,
                  ])}
            </div>
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
            {(reassignSuggestions?.suggestions || []).length > 0 && (
              <div className="suggestion-item" style={{ marginTop: 8 }}>
                {(reassignSuggestions.suggestions || []).map((s) => (
                  <div key={`${s.rank}-${s.department_name}-${s.sub_department_name}`}>
                    {s.rank}순위: {s.department_name} &gt; {s.sub_department_name} ({(Number(s.confidence || 0) * 100).toFixed(1)}%) - {s.reason}
                  </div>
                ))}
              </div>
            )}
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
