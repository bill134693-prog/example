# 민원 자동분류 시스템 - API 문서

## 📡 API 개요

**Base URL**: `http://localhost:5000/api`

모든 API는 JSON 형식의 요청/응답을 사용합니다.

---

## 🗂️ 민원 관리 API

### 민원 접수
```http
POST /complaints/
Content-Type: application/json

{
    "citizen_id": "900101-1234567",
    "citizen_name": "홍길동",
    "title": "도로 포장 손상",
    "content": "아파트 앞 도로가 패인 상태로..."
}
```

**응답 (201 Created)**
```json
{
    "success": true,
    "complaint_id": "CMPT-20260409-A1B2C3D4",
    "id": 1,
    "classification": {
        "department": "국토교통부",
        "sub_department": "도로과",
        "score": 0.87
    },
    "duplicate_alert": {
        "is_duplicate": false,
        "alert_level": "없음",
        "message": "유사한 민원이 발견되지 않았습니다.",
        "similar_count": 0
    }
}
```

### 민원 목록 조회
```http
GET /complaints/?page=1&per_page=10&status=분류완료
```

**쿼리 파라미터**
- `page` (int): 페이지 번호 (기본값: 1)
- `per_page` (int): 페이지당 항목 수 (기본값: 10)
- `status` (string): 필터링 상태 (선택사항)
  - `접수`
  - `분류완료`
  - `반복민원알림`
  - `처리`
  - `완료`

**응답 (200 OK)**
```json
{
    "complaints": [
        {
            "id": 1,
            "complaint_id": "CMPT-20260409-A1B2C3D4",
            "citizen_name": "홍길동",
            "title": "도로 포장 손상",
            "status": "분류완료",
            "department": "국토교통부",
            "sub_department": "도로과",
            "is_duplicate": false,
            "created_at": "2026-04-09T10:30:00"
        }
    ],
    "total": 5,
    "pages": 1,
    "current_page": 1
}
```

### 민원 상세 조회
```http
GET /complaints/{id}
```

**응답 (200 OK)**
```json
{
    "id": 1,
    "complaint_id": "CMPT-20260409-A1B2C3D4",
    "citizen_name": "홍길동",
    "title": "도로 포장 손상",
    "content": "아파트 앞 도로가 패인 상태로...",
    "status": "분류완료",
    "department": "국토교통부",
    "sub_department": "도로과",
    "is_duplicate": false,
    "classification_score": 0.87,
    "created_at": "2026-04-09T10:30:00"
}
```

### 민원 상태 업데이트
```http
PUT /complaints/{id}
Content-Type: application/json

{
    "status": "처리"
}
```

**응답 (200 OK)**
```json
{
    "success": true,
    "complaint_id": "CMPT-20260409-A1B2C3D4",
    "status": "처리"
}
```

---

## 🤖 분류 API

### 민원 분류 분석
```http
POST /classification/analyze
Content-Type: application/json

{
    "title": "도로 포장 손상",
    "content": "아파트 앞 도로가 패인 상태로 오래 방치되어 있습니다."
}
```

**응답 (200 OK)**
```json
{
    "success": true,
    "department": "국토교통부",
    "sub_department": "도로과",
    "confidence": {
        "department": 0.89,
        "sub_department": 0.85,
        "overall": 0.87
    },
    "classification_basis": {
        "keywords": ["도로손상", "패인도로", "포장도로"],
        "legal_basis": "도로 건설, 유지보수, 포장 관리 (국토교통부 직제 제5조)",
        "policy_basis": "도로 안전 강화 정책 (정부 보도자료 2024.03)"
    }
}
```

**분류 근거 설명**:
- `keywords`: 민원 내용에서 매칭된 분류 키워드
- `legal_basis`: 각 부처의 직제 시행규칙 기반 법적 근거
- `policy_basis`: 최근 정부 정책 및 보도자료 기반 정책 근거

### 배치 분류
```http
POST /classification/batch
Content-Type: application/json

{
    "complaints": [
        {
            "id": 1,
            "title": "악취 발생",
            "content": "공장에서 나오는 악취..."
        },
        {
            "id": 2,
            "title": "도로 손상",
            "content": "아파트 앞 도로가..."
        }
    ]
}
```

**응답 (200 OK)**
```json
{
    "success": true,
    "total": 2,
    "results": [
        {
            "id": 1,
            "department": "환경부",
            "sub_department": "대기환경과",
            "confidence": 0.82,
            "classification_basis": {
                "keywords": ["악취", "냄새", "공장"],
                "legal_basis": "대기오염 예방, 악취 관리 (환경부 직제 제2조)",
                "policy_basis": "미세먼지 저감 정책 강화 (정부 보도자료 2024.01)"
            }
        },
        {
            "id": 2,
            "department": "국토교통부",
            "sub_department": "도로과",
            "confidence": 0.87,
            "classification_basis": {
                "keywords": ["도로손상", "패인도로"],
                "legal_basis": "도로 건설, 유지보수, 포장 관리 (국토교통부 직제 제5조)",
                "policy_basis": "도로 안전 강화 정책 (정부 보도자료 2024.03)"
            }
        }
    ]
}
```

---

## 🔄 중복 감지 API

### 중복 검사
```http
POST /duplicates/check
Content-Type: application/json

{
    "citizen_id": "900101-1234567",
    "title": "도로 포장 손상",
    "content": "아파트 앞 도로가 패인 상태로..."
}
```

**응답 (200 OK)**
```json
{
    "success": true,
    "is_duplicate": true,
    "alert_level": "중간",
    "alert_message": "유사한 민원이 1건 발견되었습니다. 반복민원 검토가 필요합니다.",
    "requires_review": true,
    "similar_complaints": [
        {
            "id": 5,
            "title": "도로 손상",
            "similarity_score": 0.72,
            "created_at": "2026-04-05T14:20:00",
            "department": "국토교통부",
            "sub_department": "도로과"
        }
    ],
    "similarity_threshold": 0.6
}
```

**alert_level 유형**
- `없음`: 유사 민원 없음
- `낮음`: 40~60% 유사도 (참고)
- `중간`: 60~80% 유사도 (검토 필요)
- `높음`: 80% 이상 유사도 (긴급)

### 반복민원 알림 목록
```http
GET /duplicates/alerts?page=1&per_page=10&reviewed=false
```

**쿼리 파라미터**
- `page` (int): 페이지 번호
- `per_page` (int): 페이지당 항목 수
- `reviewed` (boolean): 검토 여부 필터

**응답 (200 OK)**
```json
{
    "alerts": [
        {
            "id": 1,
            "complaint_id": 10,
            "similar_complaint_id": 5,
            "similarity_score": 0.72,
            "alert_message": "유사한 민원이 1건 발견되었습니다.",
            "is_reviewed": false,
            "created_at": "2026-04-09T10:35:00"
        }
    ],
    "total": 3,
    "pages": 1,
    "current_page": 1
}
```

### 반복민원 알림 검토 완료
```http
PUT /duplicates/alerts/{id}
```

**응답 (200 OK)**
```json
{
    "success": true,
    "alert_id": 1,
    "is_reviewed": true
}
```

### 중복 통계
```http
GET /duplicates/stats
```

**응답 (200 OK)**
```json
{
    "total_alerts": 5,
    "unreviewed_alerts": 2,
    "reviewed_alerts": 3,
    "average_similarity": 0.68
}
```

---

## 🏢 부처/부서 관리 API

### 부처 목록 조회
```http
GET /departments/
```

**응답 (200 OK)**
```json
{
    "success": true,
    "total": 5,
    "departments": [
        {
            "id": 1,
            "name": "환경부",
            "code": "MOE",
            "description": "환경 관련 정책 및 행정",
            "sub_departments": [
                {
                    "id": 1,
                    "name": "대기환경과",
                    "code": "AE",
                    "keywords": "대기, 환기, 냄새, 오염",
                    "description": ""
                }
            ]
        }
    ]
}
```

### 부처 생성
```http
POST /departments/
Content-Type: application/json

{
    "name": "새로운부처",
    "code": "NEW",
    "description": "부처 설명"
}
```

### 부서 목록 조회
```http
GET /departments/sub-departments?department_id=1
```

### 부서 생성
```http
POST /departments/sub-departments
Content-Type: application/json

{
    "department_id": 1,
    "name": "새로운부서",
    "code": "NEW",
    "keywords": "키워드1, 키워드2",
    "description": "부서 설명"
}
```

### 샘플 데이터 초기화
```http
POST /departments/init-sample-data
```

**응답 (201 Created)**
```json
{
    "success": true,
    "message": "샘플 데이터가 생성되었습니다",
    "total_departments": 5
}
```

---

## 🚨 에러 응답

### 400 Bad Request
```json
{
    "error": "필수 필드 누락"
}
```

### 404 Not Found
```json
{
    "error": "민원을 찾을 수 없습니다"
}
```

### 500 Internal Server Error
```json
{
    "error": "오류 메시지"
}
```

---

## 📊 HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | OK - 성공 |
| 201 | Created - 생성 완료 |
| 400 | Bad Request - 잘못된 요청 |
| 404 | Not Found - 리소스 없음 |
| 500 | Server Error - 서버 오류 |

---

## ⏱️ 성능 기준

| 작업 | 예상 시간 |
|------|----------|
| 민원 접수 | ~100-150ms |
| 분류 분석 | ~30-50ms |
| 중복 검사 | ~80-120ms |
| 배치 분류 (100건) | ~2-3초 |
| 민원 목록 조회 | ~20-40ms |

---

**API 버전**: 1.0  
**마지막 업데이트**: 2026년 4월 9일
