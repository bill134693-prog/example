import React, { useEffect, useState } from 'react';
import { ComplaintForm } from '../components/ComplaintForm';
import { DuplicateAlert } from '../components/DuplicateAlert';
import { Header } from '../components/Header';
import { classificationService, complaintService, departmentService } from '../services/api';
import './HomePage.css';

export const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [classification, setClassification] = useState(null);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await departmentService.initSampleData();
      } catch {
        // already initialized
      }
    };
    init();
  }, []);

  const handleAnalyze = async (submittedFormData) => {
    setLoading(true);
    setMessage(null);
    setDuplicateAlert(null);

    try {
      const res = await classificationService.analyze(submittedFormData.title, submittedFormData.content);
      setFormData(submittedFormData);
      setClassification({
        department: res.data.department,
        sub_department: res.data.sub_department,
        score: res.data.confidence?.overall || 0,
      });
      setMessage({
        type: 'info',
        text: '추천 부서를 확인한 뒤 접수 버튼을 눌러주세요.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          '분석 API 연결에 실패했습니다. 백엔드 실행 상태를 확인해주세요. (' +
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
      });

      if (res.data?.success) {
        if (res.data?.duplicate_alert?.is_duplicate) {
          setDuplicateAlert({
            alert_level: res.data.duplicate_alert.alert_level,
            alert_message: res.data.duplicate_alert.message,
            similar_complaints: [],
          });
        }

        setMessage({
          type: 'success',
          text: `민원이 접수되었습니다. (ID: ${res.data.complaint_id})`,
        });
      }
    } catch (error) {
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
      <Header title="민원인용" description="민원 내용을 분석해 추천 부서를 확인한 뒤 접수하세요" />

      <div className="container">
        {message && <div className={`message message-${message.type}`}>{message.text}</div>}

        <div className="form-section">
          <h2>민원 접수</h2>
          <p className="step-description">1. 민원 내용을 입력하고 분석합니다.</p>
          <ComplaintForm onSubmit={handleAnalyze} loading={loading} submitLabel="추천 부서 분석" />
        </div>

        {classification && (
          <div className="recommendation-section">
            <h2>추천 부서 확인</h2>
            <p className="step-description">2. 추천 결과를 확인하고 최종 접수합니다.</p>
            <div className="recommendation-box">
              <div className="recommendation-item">
                <label>추천 부처</label>
                <span className="recommendation-value">{classification.department}</span>
              </div>
              <div className="recommendation-item">
                <label>추천 부서</label>
                <span className="recommendation-value">{classification.sub_department}</span>
              </div>
              <div className="recommendation-item">
                <label>신뢰도</label>
                <span className="recommendation-value">{(classification.score * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="recommendation-buttons">
              <button className="btn btn-confirm" onClick={handleSubmitComplaint} disabled={loading}>
                {loading ? '접수중...' : '이 추천으로 접수'}
              </button>
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
