import React from 'react';
import './DuplicateAlert.css';

export const DuplicateAlert = ({ alert }) => {
  const getAlertColor = (level) => {
    switch (level) {
      case '높음':
        return '#d32f2f';
      case '중간':
        return '#f57c00';
      case '낮음':
        return '#fbc02d';
      default:
        return '#4caf50';
    }
  };

  return (
    <div className="duplicate-alert" style={{ borderLeftColor: getAlertColor(alert.alert_level) }}>
      <div className="alert-header">
        <span className="alert-badge" style={{ backgroundColor: getAlertColor(alert.alert_level) }}>
          반복민원
        </span>
        <span className="alert-level">{alert.alert_level}</span>
      </div>

      <div className="alert-content">
        <p className="alert-message">{alert.alert_message || alert.message}</p>
        {(alert.similar_complaints || []).length > 0 && (
          <div className="similar-complaints">
            <h4>유사 민원</h4>
            <ul>
              {alert.similar_complaints.map((item) => (
                <li key={item.id || `${item.title}-${item.similarity_score}`}>
                  <div className="complaint-item">
                    <span className="complaint-title">{item.title}</span>
                    <span className="similarity-score">유사도 {(item.similarity_score * 100).toFixed(1)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
