import React from 'react';
import './ComplaintForm.css';

export const ComplaintForm = ({ onSubmit, loading, submitLabel = '내용 분석' }) => {
  const [formData, setFormData] = React.useState({
    citizenId: '',
    citizenName: '',
    citizenPhone: '',
    citizenAddress: '',
    title: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="citizenId">주민등록번호</label>
          <input type="password" id="citizenId" name="citizenId" value={formData.citizenId} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="citizenName">이름</label>
          <input type="text" id="citizenName" name="citizenName" value={formData.citizenName} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="citizenPhone">연락처</label>
          <input type="tel" id="citizenPhone" name="citizenPhone" value={formData.citizenPhone} onChange={handleChange} placeholder="010-1234-5678" required />
        </div>
        <div className="form-group">
          <label htmlFor="citizenAddress">주소</label>
          <input type="text" id="citizenAddress" name="citizenAddress" value={formData.citizenAddress} onChange={handleChange} required />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="title">민원 제목</label>
        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label htmlFor="content">민원 내용</label>
        <textarea id="content" name="content" value={formData.content} onChange={handleChange} rows="6" required />
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? '처리중...' : submitLabel}
      </button>
    </form>
  );
};
