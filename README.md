# 민원 자동분류 시스템

Flask(백엔드) + React(프론트엔드) 기반의 민원 접수/분류/반복민원 감지 시스템입니다.

## 1) 실행 전 준비

- Python 3.10+
- Node.js 18+

## 2) 빠른 실행

프로젝트 루트에서:

```bash
python start.py
```

정상 실행 시:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 3) 수동 실행

### Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## 4) 주요 API

- `POST /api/complaints/` 민원 접수
- `GET /api/complaints/` 민원 목록
- `GET /api/complaints/<id>` 민원 상세
- `PUT /api/complaints/<id>/answer` 답변 처리
- `PUT /api/complaints/<id>/close` 종결 처리
- `POST /api/classification/analyze` 분류 분석
- `POST /api/duplicates/check` 반복민원 검사
- `GET /api/departments/` 부처/부서 목록
- `POST /api/departments/init-sample-data` 샘플 데이터 초기화

## 5) 참고

- 첫 실행 시 홈 화면에서 샘플 부처/부서 데이터 초기화 API가 자동 호출됩니다.
- 현재 기본 DB는 SQLite(`backend/complaint.db`)입니다.
