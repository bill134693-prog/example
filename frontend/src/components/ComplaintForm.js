import React from 'react';
import './ComplaintForm.css';

export const ComplaintForm = ({ onSubmit, loading, submitLabel = '내용 분석' }) => {
  const [formData, setFormData] = React.useState({
    citizenIdFront: '',
    citizenIdBack: '',
    citizenName: '',
    citizenPhone: '',
    citizenAddress: '',
    title: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'citizenIdFront') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, citizenIdFront: sanitized }));
      return;
    }

    if (name === 'citizenIdBack') {
      const sanitized = value.replace(/\D/g, '').slice(0, 7);
      setFormData((prev) => ({ ...prev, citizenIdBack: sanitized }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.citizenIdFront.length !== 6 || formData.citizenIdBack.length !== 7) {
      alert('주민등록번호를 xxxxxx-xxxxxxx 형식으로 입력해주세요.');
      return;
    }

    onSubmit({
      ...formData,
      citizenId: `${formData.citizenIdFront}-${formData.citizenIdBack}`,
    });
  };

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="citizenName">이름</label>
          <input type="text" id="citizenName" name="citizenName" value={formData.citizenName} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="citizenIdFront">주민등록번호</label>
          <div className="resident-id-inputs">
            <input
              type="password"
              id="citizenIdFront"
              name="citizenIdFront"
              value={formData.citizenIdFront}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="앞 6자리"
              required
            />
            <span className="resident-id-separator">-</span>
            <input
              type="password"
              id="citizenIdBack"
              name="citizenIdBack"
              value={formData.citizenIdBack}
              onChange={handleChange}
              inputMode="numeric"
              pattern="[0-9]{7}"
              placeholder="뒤 7자리"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="citizenPhone">연락처</label>
          <input
            type="tel"
            id="citizenPhone"
            name="citizenPhone"
            value={formData.citizenPhone}
            onChange={handleChange}
            placeholder="010-1234-5678"
            required
          />
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
