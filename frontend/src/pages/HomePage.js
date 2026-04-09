import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ComplaintForm } from '../components/ComplaintForm';
import { DuplicateAlert } from '../components/DuplicateAlert';
import { Header } from '../components/Header';
import { classificationService, complaintService, departmentService } from '../services/api';
import {
  getLocalRecommendation,
  summarizeComplaintContent,
  estimateComplaintDueBusinessDays,
} from '../services/localRecommendation';
import './HomePage.css';

const LOCAL_FALLBACK_COMPLAINTS_KEY = 'local_fallback_complaints';

const buildRecommendationReason = (basis) => {
  if (!basis) {
    return '민원 본문 키워드와 담당 업무 매칭 결과를 기반으로 추천되었습니다.';
  }

  const parts = [];

  if (basis.reason) parts.push(basis.reason);
  if (basis.keywords && basis.keywords.length > 0) parts.push(`키워드 일치: ${basis.keywords.join(', ')}`);
  if (basis.legal_basis) parts.push(`근거 법령: ${basis.legal_basis}`);

  return parts.length > 0
    ? parts.join(' | ')
    : '민원 본문 키워드와 담당 업무 매칭 결과를 기반으로 추천되었습니다.';
};

const pickNonEmpty = (...values) =>
  values.find((v) => typeof v === 'string' && v.trim().length > 0) || '';

export const HomePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [classification, setClassification] = useState(null);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [formData, setFormData] = useState(null);
  const [createdComplaintId, setCreatedComplaintId] = useState(null);
  const [nonActionableNotice, setNonActionableNotice] = useState('');
  const [selectedRecommendationIndex, setSelectedRecommendationIndex] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        // 비파괴 업서트 동기화(기존 부처/부서 FK를 유지)
        await departmentService.initSampleData(false);
      } catch {
        // ignore
      }
    };
    init();
  }, []);

  const handleAnalyze = async (submittedFormData) => {
    setLoading(true);
    setMessage(null);
    setDuplicateAlert(null);
    setCreatedComplaintId(null);
    setNonActionableNotice('');
    setSelectedRecommendationIndex(0);

    try {
      const res = await classificationService.analyze(submittedFormData.title, submittedFormData.content);
      const local = getLocalRecommendation(submittedFormData.title, submittedFormData.content);
      const payload = res?.data || {};
      const basis = payload.classification_basis || local.classification_basis || {};

      const department = pickNonEmpty(
        payload.department,
        payload.recommended_department,
        payload.result?.department,
        local.department,
      );
      const subDepartment = pickNonEmpty(
        payload.sub_department,
        payload.recommended_sub_department,
        payload.result?.sub_department,
        local.sub_department,
      );
      const score = Number(payload.confidence?.overall ?? payload.overall_score ?? local.confidence?.overall ?? 0);
      const recommendations = Array.isArray(payload.recommendations) && payload.recommendations.length > 0
        ? payload.recommendations
        : [
            {
              department,
              sub_department: subDepartment,
              confidence: { overall: score },
              classification_basis: basis,
            },
          ];

      setFormData(submittedFormData);
      setClassification({
        department,
        sub_department: subDepartment,
        score: Number.isFinite(score) ? score : 0,
        reason: buildRecommendationReason(basis),
        recommendations: recommendations.slice(0, 3).map((r) => ({
          department: r.department,
          sub_department: r.sub_department,
          score: Number(r?.confidence?.overall ?? r?.overall_score ?? 0),
          reason: buildRecommendationReason(r.classification_basis),
          basis: r.classification_basis,
        })),
      });
      if (String(department).startsWith('추천 어려움')) {
        setNonActionableNotice(
          basis.reason ||
            '입력하신 내용은 민원 처리에 관한 법률상 민원 정의에 해당하는지 확인이 필요합니다. 대상 기관과 요청사항을 구체적으로 작성해 주세요.'
        );
      }

      setMessage({
        type: 'info',
        text: payload.fallback_local
          ? '분석 API 연결이 불안정해 로컬 규칙 기반 추천을 표시했습니다. 추천 정보를 확인한 뒤 접수하세요.'
          : '추천 정보를 확인한 뒤 접수 버튼을 눌러주세요.',
      });
    } catch (error) {
      const status = error.response?.status;
      setMessage({
        type: 'error',
        text:
          `분석 API 연결에 실패했습니다${status ? ` (HTTP ${status})` : ''}. 백엔드 실행 상태를 확인해주세요. (` +
          (error.response?.data?.error || error.message) +
          ')',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!formData) return;

    setLoading(true);
    setMessage(null);
    setDuplicateAlert(null);

    try {
      const res = await complaintService.createComplaint({
        citizen_id: formData.citizenId,
        citizen_name: formData.citizenName,
        citizen_phone: formData.citizenPhone,
        citizen_address: formData.citizenAddress,
        title: formData.title,
        content: formData.content,
        preferred_department: classification?.recommendations?.[selectedRecommendationIndex]?.department || classification?.department,
        preferred_sub_department:
          classification?.recommendations?.[selectedRecommendationIndex]?.sub_department || classification?.sub_department,
        preferred_reason: classification?.recommendations?.[selectedRecommendationIndex]?.reason || classification?.reason,
        preferred_confidence:
          classification?.recommendations?.[selectedRecommendationIndex]?.score ?? classification?.score ?? 0,
      });

      if (res.data?.success) {
        if (res.data?.local_fallback) {
          try {
            const raw = window.localStorage.getItem(LOCAL_FALLBACK_COMPLAINTS_KEY);
            const items = raw ? JSON.parse(raw) : [];
            const newItem = {
              id: `local-${res.data.complaint_id}`,
              complaint_id: res.data.complaint_id,
              citizen_name: formData.citizenName,
              title: formData.title,
              content: formData.content,
              content_summary: summarizeComplaintContent(formData.title, formData.content),
              status: '분류완료',
              complaint_type: estimateComplaintDueBusinessDays(formData.title, formData.content).type,
              department:
                classification?.recommendations?.[selectedRecommendationIndex]?.department || classification?.department || null,
              sub_department:
                classification?.recommendations?.[selectedRecommendationIndex]?.sub_department ||
                classification?.sub_department ||
                null,
              classification_score:
                classification?.recommendations?.[selectedRecommendationIndex]?.score ?? classification?.score ?? 0,
              is_duplicate: false,
              repeat_count: 0,
              received_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              remaining_days: estimateComplaintDueBusinessDays(formData.title, formData.content).days,
              local_fallback: true,
            };
            const deduped = [newItem, ...items.filter((x) => x.complaint_id !== newItem.complaint_id)];
            window.localStorage.setItem(LOCAL_FALLBACK_COMPLAINTS_KEY, JSON.stringify(deduped.slice(0, 200)));
          } catch {
            // ignore local storage errors
          }
        }

        if (res.data?.duplicate_alert?.is_duplicate) {
          setDuplicateAlert({
            alert_level: res.data.duplicate_alert.alert_level,
            alert_message: res.data.duplicate_alert.message,
            similar_complaints: [],
          });
        }

        setCreatedComplaintId(res.data.id || null);
        setMessage({
          type: 'success',
          text: `접수가 완료되었습니다. (신청번호: ${res.data.complaint_id})`,
        });
      }
    } catch (error) {
      console.error('createComplaint error', error);
      setMessage({
        type: 'error',
        text: `민원 접수 실패: ${error.response?.data?.error || error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <Header title="민원인용" description="민원 내용을 분석해 추천 정보를 확인한 뒤 접수하세요" />

      <div className="container">
        {message && <div className={`message message-${message.type}`}>{message.text}</div>}

        <div className="form-section">
          <h2>민원 접수</h2>
          <p className="step-description">1. 민원 내용을 입력하고 분석합니다.</p>
          <ComplaintForm onSubmit={handleAnalyze} loading={loading} submitLabel="추천 부서 분석" />
        </div>

        {classification && (
          <div className="recommendation-section">
            <h2>추천 정보 확인</h2>
            <p className="step-description">2. 추천 결과를 확인하고 최종 접수합니다.</p>
            <div className="recommendation-box">
              {(classification.recommendations || []).map((rec, idx) => (
                <label
                  key={`${rec.department}-${rec.sub_department}-${idx}`}
                  className="recommendation-item"
                  style={{
                    display: 'block',
                    border: selectedRecommendationIndex === idx ? '2px solid #2f9e44' : '1px solid #d7e3d9',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 8,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="recommendation"
                    checked={selectedRecommendationIndex === idx}
                    onChange={() => setSelectedRecommendationIndex(idx)}
                    style={{ marginRight: 8 }}
                  />
                  <strong>{idx + 1}순위</strong> {rec.department} &gt; {rec.sub_department}
                  <div className="recommendation-value" style={{ marginTop: 6 }}>
                    추천 사유: {rec.reason}
                  </div>
                  <div className="recommendation-value">신뢰도: {(rec.score * 100).toFixed(1)}%</div>
                </label>
              ))}
            </div>

            {nonActionableNotice && (
              <div className="message message-error" style={{ marginTop: 12 }}>
                {nonActionableNotice}
              </div>
            )}

            <div className="recommendation-buttons">
              <button
                className="btn btn-confirm"
                onClick={handleSubmitComplaint}
                disabled={loading || Boolean(nonActionableNotice)}
              >
                {loading ? '접수중...' : '이 추천으로 접수'}
              </button>

              {createdComplaintId && (
                <button
                  className="btn btn-cancel"
                  onClick={() => navigate(`/dashboard?complaintId=${createdComplaintId}`)}
                >
                  공무원용에서 확인하기
                </button>
              )}
            </div>
          </div>
        )}

        {duplicateAlert && (
          <div className="alert-section">
            <h2>반복 민원 알림</h2>
            <DuplicateAlert alert={duplicateAlert} />
          </div>
        )}
      </div>
    </div>
  );
};
