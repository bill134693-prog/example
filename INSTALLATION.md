# 민원 자동분류 시스템 - 설치 및 실행 가이드

## 📋 시스템 요구사항

### 필수 요구사항
- Windows 10+ / macOS 10.15+ / Linux (Ubuntu 20.04+)
- Python 3.8 이상
- Node.js 14 이상 (npm 포함)
- PostgreSQL 12 이상

## 🚀 단계별 설치 가이드

### 1단계: 프로젝트 구조 확인

```
example/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── classification_engine.py
│   │   ├── duplicate_detector.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── complaint_routes.py
│   │   │   ├── classification_routes.py
│   │   │   ├── duplicate_routes.py
│   │   │   └── department_routes.py
│   │   └── data/
│   ├── models/          # ML 모델 저장 경로
│   ├── config.py
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

### 2단계: PostgreSQL 설정

#### Windows
1. [PostgreSQL 다운로드](https://www.postgresql.org/download/windows/)
2. 설치 중 비밀번호 설정 (예: `password`)
3. 포트는 기본값 5432 사용

#### macOS (Homebrew 사용)
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Linux (Ubuntu)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### 데이터베이스 생성
```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE complaint_db;
CREATE USER complaint_user WITH PASSWORD 'complaint_password';
ALTER ROLE complaint_user SET client_encoding TO 'utf8';
ALTER ROLE complaint_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE complaint_db TO complaint_user;
\q
```

### 3단계: Backend 설정

```bash
# backend 디렉토리로 이동
cd backend

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# .env 파일 생성
copy .env.example .env
# 또는 .env.example 파일을 .env로 이름 변경

# .env 파일 수정 (PostgreSQL 연결 정보)
DATABASE_URL=postgresql://complaint_user:complaint_password@localhost:5432/complaint_db
FLASK_ENV=development
FLASK_DEBUG=True
```

#### Backend 테스트
```bash
# 모델 학습 및 DB 초기화
python run.py

# 브라우저에서 확인
# http://localhost:5000
```

### 4단계: Frontend 설정

```bash
# frontend 디렉토리로 이동
cd ../frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 자동으로 http://localhost:3000 에서 열림
```

## 🔄 동시 실행 (권장 방법)

### 방법 1: 터미널 분할 (VS Code 사용 권장)

```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate  # Windows
python run.py

# Terminal 2 - Frontend
cd frontend
npm start
```

### 방법 2: 별도 명령 프롬프트/터미널

```bash
# 첫 번째 창
cd backend
venv\Scripts\activate
python run.py

# 두 번째 창
cd frontend
npm start
```

## 📱 웹 애플리케이션 접속

1. 브라우저에서 `http://localhost:3000` 열기
2. 다음 기능 사용 가능:
   - **민원 접수**: `/` (홈페이지)
   - **대시보드**: `/dashboard`

## 🧪 샘플 데이터 초기화

첫 실행 시 자동으로 다음 부처/부서 샘플 데이터 생성:

- **환경부**: 대기환경과, 수질환경과
- **국토교통부**: 도로과, 대중교통과, 교통안전과
- **보건복지부**: 의료정책과, 질병대응과, 노인정책과
- **경찰청**: 교통경찰과, 수사과
- **교육부**: 학교정책과, 특수교육과

## 🧪 테스트 민원 예시

### 예시 1: 대기오염
```
이름: 홍길동
주민등록번호: 900101-1234567
제목: 근처 공장에서 나오는 악취
내용: 거주지역 근처에 위치한 화학공장에서 매일 악취가 나고, 
     이로 인해 주민들이 불편을 겪고 있습니다.

→ 자동분류: 환경부 > 대기환경과 (신뢰도: ~85%)
```

### 예시 2: 도로 포장
```
이름: 김영희
주민등록번호: 900202-2345678
제목: 아파트 앞 도로 포장 손상
내용: 아파트 앞 도로가 패인 상태로 오래 방치되어 있으며,
     자동차 통행에 위험을 초래하고 있습니다.

→ 자동분류: 국토교통부 > 도로과 (신뢰도: ~90%)
```

## ⚙️ 환경 변수 설정

### Backend (.env)
```
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
DATABASE_URL=postgresql://complaint_user:complaint_password@127.0.0.1:5432/complaint_db
SECRET_KEY=dev-secret-key-change-in-production
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🐛 문제 해결

### PostgreSQL 연결 실패
```
오류: "could not translate host name"
해결: DATABASE_URL에서 localhost를 127.0.0.1로 변경
```

### Port 이미 사용 중
```bash
# Backend (포트 5000 변경)
FLASK_PORT=5001 python run.py

# Frontend (포트 3000 변경)
PORT=3001 npm start
```

### 모듈 import 오류
```bash
# Backend에서 가상환경 재활성화
venv\Scripts\activate
pip install -r requirements.txt
```

### 의존성 버전 충돌
```bash
# Frontend
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📊 성능 모니터링

### Backend API 응답 시간
- 분류 API: ~50ms
- 중복 검사: ~100ms
- 민원 접수: ~150ms

### Database 최적화

```sql
-- 빠른 조회를 위한 인덱스 생성
CREATE INDEX idx_complaint_citizen_id ON complaints(citizen_id);
CREATE INDEX idx_complaint_status ON complaints(status);
CREATE INDEX idx_duplicate_alert_reviewed ON duplicate_alerts(is_reviewed);
```

## 🔐 프로덕션 배포 전 체크리스트

- [ ] PostgreSQL 보안 설정 (비밀번호 변경)
- [ ] SECRET_KEY 무작위 문자열로 변경
- [ ] FLASK_DEBUG = False로 설정
- [ ] CORS 설정 검토
- [ ] SSL/TLS 인증서 설정
- [ ] 로깅 시스템 구성
- [ ] 백업 정책 수립

## 📞 지원

문제 발생 시:
1. 로그 파일 확인
2. 터미널 에러 메시지 검토
3. 의존성 버전 확인
4. 데이터베이스 연결 상태 확인

---

**마지막 업데이트**: 2026년 4월 9일
