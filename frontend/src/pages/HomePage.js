import React, { useEffect, useState } from 'react';
import { ComplaintForm } from '../components/ComplaintForm';
import { DuplicateAlert } from '../components/DuplicateAlert';
import { Header } from '../components/Header';
import { complaintService, departmentService, duplicateService } from '../services/api';
import './HomePage.css';

export const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [classification, setClassification] = useState(null);
  const [duplicateAlert, setDuplicateAlert] = useState(null);

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

  const handleComplaintSubmit = async (formData) => {
    setLoading(true);
    setMessage(null);
    setClassification(null);
    setDuplicateAlert(null);

    try {
      const dup = await duplicateService.checkDuplicate(formData.citizenId, formData.title, formData.content);
      if (dup.data?.is_duplicate) {
        setDuplicateAlert(dup.data);
      }

      const res = await complaintService.createComplaint({
        citizen_id: formData.citizenId,
        citizen_name: formData.citizenName,
        citizen_phone: formData.citizenPhone,
        citizen_address: formData.citizenAddress,
        title: formData.title,
        content: formData.content,
      });

      if (res.data?.success) {
        setClassification(res.data.classification);
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
      <Header
        title="민원 자동분류 시스템"
        description="민원 내용을 분석해 담당 부처와 부서를 자동 추천합니다"
      />

      <div className="container">
        {message && <div className={`message message-${message.type}`}>{message.text}</div>}

        <div className="form-section">
          <h2>민원 접수</h2>
          <ComplaintForm onSubmit={handleComplaintSubmit} loading={loading} />
        </div>

        {duplicateAlert && (
          <div className="alert-section">
            <h2>반복 민원 알림</h2>
            <DuplicateAlert alert={duplicateAlert} />
          </div>
        )}

        {classification && (
          <div className="recommendation-section">
            <h2>자동 분류 결과</h2>
            <div className="recommendation-box">
              <div className="recommendation-item">
                <label>부처</label>
                <span>{classification.department}</span>
              </div>
              <div className="recommendation-item">
                <label>부서</label>
                <span>{classification.sub_department}</span>
              </div>
              <div className="recommendation-item">
                <label>신뢰도</label>
                <span>{(classification.score * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
