# 민원 자동분류 시스템 - Copilot 지침

## 프로젝트 개요
AI 기반 민원 자동분류 시스템으로, 자연어 처리를 통해 민원을 자동으로 분석하고 담당 부처 및 부서에 자동으로 분류합니다. 동일인의 유사 민원 반복 접수 시 "반복민원 검토" 알림을 자동 발송합니다.

## 기술 스택
- **Backend**: Python 3.8+, Flask, SQLAlchemy, PostgreSQL
- **ML/NLP**: scikit-learn (TF-IDF, Random Forest, Cosine Similarity)
- **Frontend**: React 18, React Router, Axios
- **Database**: PostgreSQL 12+

## 핵심 기능
1. **자동분류**: ML 모델과 규칙 기반을 통한 민원의 부처/부서 자동 분류
2. **분류 근거 제시**: 법적근거(직제 규칙), 정책근거(정부 보도자료), 매칭 키워드 표시
3. **중복감지**: 코사인 유사도를 이용한 반복민원 자동 감지
4. **알림시스템**: 60~80% 유사도 범위의 반복민원에 대한 알림
5. **대시보드**: 실시간 통계 및 중복 민원 모니터링

## 분류 기준 (2024년)
### 법적 근거
- 각 정부부처의 직제 시행규칙 (2024년 버전)
- 예: 환경부 직제 제2조(대기환경), 국토교통부 직제 제5조(도로)

### 정책 근거
- 최근 정부 정책 동향 및 보도자료
- 예: 미세먼지 저감 정책(MOE), 도로 안전 강화(MOLIT)

### 분류 키워드
- 부처/부서별로 정의된 58개 키워드
- 환경부: 악취, 미세먼지, 수질오염 등
- 국토교통부: 도로손상, 신호등, 버스 등
- 보건복지부: 백신, 의료기관, 노인복지 등
- 경찰청: 불법주차, 범죄신고 등
- 교육부: 급식비, 특수교육 등

## 파일 구조
```
backend/
├── app/
│   ├── models.py           # SQLAlchemy 데이터 모델
│   ├── classification_engine.py  # ML 분류 엔진 + 분류 규칙
│   ├── duplicate_detector.py     # 중복 감지 엔진
│   └── routes/             # API 라우트 핸들러
├── config.py               # 설정 관리
├── run.py                  # 애플리케이션 엔트리포인트
└── requirements.txt        # 의존성

frontend/
├── src/
│   ├── components/        # React 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   ├── services/         # API 서비스
│   └── App.js            # 메인 앱
└── package.json

문서/
├── README.md                    # 프로젝트 개요
├── CLASSIFICATION_STANDARDS.md  # 부처별 분류 기준 상세 매뉴얼
├── CLASSIFICATION_EXAMPLES.md   # 실제 분류 사례 (5가지)
├── API_DOCUMENTATION.md         # API 명세서
└── INSTALLATION.md              # 설치 및 실행 가이드
```

## 개발 환경 설정
1. Python 가상환경: `python -m venv venv`
2. Backend 기동: `python run.py` (포트 5000)
3. Frontend 기동: `npm start` (포트 3000)
4. PostgreSQL 연결: DATABASE_URL 환경변수 설정

## API 엔드포인트
- POST `/api/complaints/` - 민원 접수 (자동분류 + 중복 검사) **분류 근거 포함**
- POST `/api/classification/analyze` - 분류 분석 **분류 근거 포함**
- POST `/api/duplicates/check` - 중복 검사
- GET `/api/duplicates/alerts` - 반복민원 알림 조회
- GET `/api/departments/` - 부처/부서 조회

## 분류 신뢰도 기준
- **높음 (80% 이상)**: 자동 할당 가능
- **중간 (60~80%)**: 담당자 확인 권장
- **낮음 (60% 미만)**: 수동 검토 필수

## 모델 성능
- 분류 신뢰도: 60~95% (평균 82%)
- 중복 감지 유사도 임계값: 0.6 (60%)
- API 응답 시간: 30-150ms

## 주요 개발 규칙
1. 모든 API는 JSON 응답 사용
2. 주민등록번호는 SHA-256 해싱으로 저장
3. 유사도 계산은 TF-IDF + Cosine Similarity 사용
4. 부처/부서 분류는 Random Forest 앙상블 모델 사용
5. 분류 근거는 API 응답에 항상 포함
6. 반복민원 판정: 동일인 + 60% 이상 유사도

## 테스트 및 배포
- 개발: `FLASK_ENV=development` + `FLASK_DEBUG=True`
- 프로덕션: `FLASK_ENV=production` + `FLASK_DEBUG=False`
- 데이터베이스: 초기화 시 샘플 데이터 자동 생성

## 주요 클래스 및 함수
- `ComplaintClassificationEngine`: ML 기반 분류 엔진 + 규칙 기반 분류
- `DuplicateDetector`: 유사도 기반 중복 민원 감지
- `Complaint`, `Department`, `SubDepartment`: 데이터 모델
- API 라우트: complaint_routes, classification_routes, duplicate_routes, department_routes

## 분류 근거 제시 방식
API 응답에 다음 정보 포함:
```json
"classification_basis": {
    "keywords": ["도로손상", "패인도로"],
    "legal_basis": "도로 건설, 유지보수, 포장 관리 (국토교통부 직제 제5조)",
    "policy_basis": "도로 안전 강화 정책 (정부 보도자료 2024.03)"
}
```

---
**마지막 업데이트**: 2026년 4월 9일  
**버전**: 2.0 (분류 기준 강화 버전)

