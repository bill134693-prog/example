import re
from collections import defaultdict
from typing import Dict, List


class ComplaintClassificationEngine:
    """규칙 기반 민원 자동 분류 엔진."""

    def __init__(self) -> None:
        self.classification_rules = {
            "환경부": {
                "대기환경과": {
                    "keywords": ["미세먼지", "악취", "대기", "배출", "공기", "먼지", "소각"],
                    "description": "대기오염 및 미세먼지 관리 업무",
                    "policy": "대기질 개선 및 배출 저감 정책"
                },
                "수질환경과": {
                    "keywords": ["수질", "하천", "오염수", "폐수", "방류", "지하수", "수돗물"],
                    "description": "수질오염 및 수자원 관리 업무",
                    "policy": "수질 개선 및 수생태계 보호 정책"
                },
            },
            "국토교통부": {
                "도로과": {
                    "keywords": ["도로", "포트홀", "아스팔트", "가로등", "인도", "보도블록", "공사"],
                    "description": "도로 유지보수 및 도로시설 관리 업무",
                    "policy": "도로 안전 강화 정책"
                },
                "대중교통과": {
                    "keywords": ["버스", "지하철", "배차", "환승", "요금", "정류장", "노선"],
                    "description": "버스·철도 등 대중교통 운영 정책 업무",
                    "policy": "대중교통 이용 편의 개선 정책"
                },
                "교통안전과": {
                    "keywords": ["신호등", "교통사고", "횡단보도", "과속", "안전시설", "단속"],
                    "description": "교통안전 시설 및 사고 예방 업무",
                    "policy": "교통사고 감소 및 안전 인프라 확대 정책"
                },
            },
            "보건복지부": {
                "의료정책과": {
                    "keywords": ["병원", "의료", "약국", "진료", "수술", "마스크", "의약품"],
                    "description": "의료서비스 및 의약품 관리 업무",
                    "policy": "의료 접근성 및 진료 품질 개선 정책"
                },
                "질병대응과": {
                    "keywords": ["백신", "감염", "검사", "격리", "방역", "코로나", "질병"],
                    "description": "감염병 대응 및 방역 업무",
                    "policy": "공중보건 위기 대응 정책"
                },
                "노인정책과": {
                    "keywords": ["노인", "요양", "기초연금", "돌봄", "복지", "장기요양"],
                    "description": "노인복지 및 돌봄 정책 업무",
                    "policy": "고령층 생활 안정 및 돌봄 강화 정책"
                },
            },
            "경찰청": {
                "교통경찰과": {
                    "keywords": ["불법주정차", "주차", "교통법규", "면허", "신호위반", "음주운전"],
                    "description": "교통법규 위반 및 교통단속 업무",
                    "policy": "교통질서 확립 및 안전 강화 정책"
                },
                "수사과": {
                    "keywords": ["폭행", "사기", "협박", "절도", "고소", "신고", "수사"],
                    "description": "범죄 신고 및 수사 업무",
                    "policy": "치안 강화 및 범죄 대응 정책"
                },
            },
            "교육부": {
                "학교정책과": {
                    "keywords": ["학교", "급식", "교실", "등록금", "장학", "교복", "학부모"],
                    "description": "학교 운영 및 학생 지원 정책 업무",
                    "policy": "학교 교육 여건 개선 정책"
                },
                "특수교육과": {
                    "keywords": ["특수교육", "장애학생", "통합교육", "보조기기", "개별지원"],
                    "description": "특수교육 지원 정책 업무",
                    "policy": "특수교육 접근성 확대 정책"
                },
            },
        }

        self.default_department = "국토교통부"
        self.default_sub_department = "도로과"

    def _normalize_text(self, text: str) -> str:
        cleaned = re.sub(r"\s+", " ", text or "").strip().lower()
        return cleaned

    def _score_candidates(self, text: str) -> Dict[str, Dict[str, int]]:
        scores: Dict[str, Dict[str, int]] = defaultdict(dict)
        for dept, sub_map in self.classification_rules.items():
            for sub_dept, meta in sub_map.items():
                score = 0
                for keyword in meta["keywords"]:
                    if keyword.lower() in text:
                        score += 1
                scores[dept][sub_dept] = score
        return scores

    def _pick_best(self, scores: Dict[str, Dict[str, int]]) -> tuple[str, str, int]:
        best_dept = self.default_department
        best_sub = self.default_sub_department
        best_score = -1
        for dept, sub_map in scores.items():
            for sub_dept, score in sub_map.items():
                if score > best_score:
                    best_dept = dept
                    best_sub = sub_dept
                    best_score = score
        return best_dept, best_sub, max(best_score, 0)

    def _extract_keywords(self, text: str, dept: str, sub_dept: str) -> List[str]:
        keywords = self.classification_rules[dept][sub_dept]["keywords"]
        return [k for k in keywords if k.lower() in text]

    def classify(self, title: str, content: str) -> dict:
        text = self._normalize_text(f"{title} {content}")
        scores = self._score_candidates(text)
        dept, sub_dept, best_score = self._pick_best(scores)

        matched_keywords = self._extract_keywords(text, dept, sub_dept)
        keyword_total = len(self.classification_rules[dept][sub_dept]["keywords"])
        confidence = min(0.95, 0.45 + (best_score / max(keyword_total, 1)) * 0.5)

        return {
            "department": dept,
            "sub_department": sub_dept,
            "department_score": float(confidence),
            "sub_department_score": float(confidence),
            "overall_score": float(confidence),
            "classification_basis": {
                "keywords": matched_keywords,
                "legal_basis": self.classification_rules[dept][sub_dept]["description"],
                "policy_basis": self.classification_rules[dept][sub_dept]["policy"],
            },
        }

    def generate_content_summary(self, title: str, content: str, dept: str = None, sub_dept: str = None) -> str:
        raw = self._normalize_text(content)
        if not raw:
            return f"[{title}]"

        sentences = [s.strip() for s in re.split(r"[.!?\n]", content) if s.strip()]
        if not sentences:
            summary = raw[:120]
        else:
            summary = sentences[0]

        if len(summary) > 280:
            summary = summary[:277] + "..."

        return f"[{title}] {summary}"


classification_engine = ComplaintClassificationEngine()
