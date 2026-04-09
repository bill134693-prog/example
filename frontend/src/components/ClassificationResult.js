import React from 'react';
import './ClassificationResult.css';

export const ClassificationResult = ({ result }) => {
  if (!result) return null;

  return (
    <div className="classification-result">
      <div className="result-header">
        <h3>자동 분류 결과</h3>
      </div>

      <div className="result-content">
        <div className="classification-item">
          <label>담당 부처</label>
          <div className="classification-value">{result.department}</div>
        </div>

        <div className="classification-item">
          <label>담당 부서</label>
          <div className="classification-value">{result.sub_department}</div>
        </div>

        <div className="classification-item">
          <label>신뢰도</label>
          <div className="classification-value">{(result.score * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};
