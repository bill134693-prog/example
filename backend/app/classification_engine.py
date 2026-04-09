import re
from typing import Dict, List, Tuple

from app.legal_basis_data import LEGAL_CLASSIFICATION_RULES


class ComplaintClassificationEngine:
    """정부조직법/직제 시행규칙 참고 기반 민원 분류 엔진."""

    def __init__(self) -> None:
        self.rules = LEGAL_CLASSIFICATION_RULES
        self.default_department = "고용노동부"
        self.default_sub_department = "고용서비스기반과"

    @staticmethod
    def _normalize_text(text: str) -> str:
        text = text or ""
        return re.sub(r"\s+", " ", text).strip().lower()

    @staticmethod
    def _contains_any(text: str, keywords: List[str]) -> bool:
        text = text or ""
        lowered = [str(k).lower() for k in keywords]
        return any(k in text for k in lowered)

    def _is_local_government(self, dept_name: str) -> bool:
        return self.rules.get(dept_name, {}).get("category") == "local"

    def _build_non_actionable_result(self, reason: str, matched_keywords: List[str]) -> dict:
        return {
            "department": "추천 어려움(요지 불분명 또는 민원 정의 외)",
            "sub_department": "추가 사실관계 확인 필요",
            "department_code": None,
            "sub_department_code": None,
            "department_score": 0.0,
            "sub_department_score": 0.0,
            "overall_score": 0.0,
            "classification_basis": {
                "keywords": matched_keywords,
                "legal_basis": "민원 처리에 관한 법률 제2조(민원의 정의)",
                "policy_basis": "행정기관 처리 대상 여부 사전 확인 필요",
                "reason": reason,
            },
        }

    def _check_non_actionable(self, text: str, best_score: int) -> Tuple[bool, str, List[str]]:
        private_terms = [
            "사인간",
            "개인 간",
            "개인사",
            "연인",
            "부부싸움",
            "친구와",
            "지인과",
            "채무",
            "돈을 빌려",
            "민사소송",
            "사적 분쟁",
        ]
        admin_terms = [
            "시청",
            "구청",
            "군청",
            "주민센터",
            "동사무소",
            "행정기관",
            "공무원",
            "허가",
            "신고",
            "단속",
            "처분",
        ]
        vague_terms = ["문의", "상담", "도와주세요", "모르겠", "확인 부탁", "처리 부탁"]
        matched_private = [k for k in private_terms if k in text]
        has_admin_context = self._contains_any(text, admin_terms)
        word_count = len([w for w in text.split(" ") if w.strip()])
        has_vague_only_signal = self._contains_any(text, vague_terms) and best_score <= 5 and word_count <= 12

        if matched_private and not has_admin_context:
            return (
                True,
                "사인간 권리관계·민사 분쟁 성격으로 보여 민원 처리에 관한 법률상 행정기관 처리 민원에 해당하지 않을 수 있습니다.",
                matched_private,
            )

        if has_vague_only_signal:
            return (
                True,
                "민원의 핵심 사실관계가 부족해 담당 부서를 특정하기 어렵습니다. 대상 기관, 발생 시점, 요청사항을 구체적으로 작성해 주세요.",
                [],
            )

        if best_score <= 2:
            return (
                True,
                "민원의 요지가 불분명하여 담당 부서 자동 추천이 어렵습니다. 대상 기관·쟁점·요청사항을 구체적으로 작성해 주세요.",
                [],
            )

        return False, "", []

    def _intent_boost(self, dept_name: str, sub_name: str, text: str) -> int:
        score = 0
        dept_meta = self.rules.get(dept_name, {})

        if dept_name == "고용노동부" and sub_name == "퇴직연금복지과":
            if self._contains_any(text, ["퇴직금", "퇴직연금", "퇴직급여"]):
                score += 5
            if self._contains_any(text, ["요건", "조건", "자격", "받을 수", "가능", "해당"]):
                score += 3
            if self._contains_any(text, ["1년", "12개월", "365일", "360일", "계속근로", "근속"]):
                score += 4
            if self._contains_any(text, ["주 15시간", "소정근로시간"]):
                score += 2

        if dept_name == "고용노동부" and sub_name == "근로감독기획과":
            if self._contains_any(text, ["임금", "체불", "야근수당", "연장수당", "최저임금"]):
                score += 4
            if self._contains_any(text, ["근로계약서", "해고", "부당해고", "직장내괴롭힘"]):
                score += 4

        if dept_name == "고용노동부" and sub_name == "고객상담센터 인터넷상담과":
            if self._contains_any(text, ["문의", "상담", "질문", "알려주세요", "답변", "인터넷"]):
                score += 3

        if self._is_local_government(dept_name):
            aliases = [dept_name, *dept_meta.get("aliases", [])]
            if self._contains_any(text, aliases):
                score += 5
            if self._contains_any(text, ["시청", "도청", "군청", "구청", "주민센터"]):
                score += 3

            if sub_name == "민원여권과" and self._contains_any(
                text, ["등본", "초본", "전입신고", "인감", "가족관계증명", "여권"]
            ):
                score += 4
            if sub_name == "교통행정과" and self._contains_any(text, ["불법주정차", "주차단속", "마을버스", "교통민원"]):
                score += 4
            if sub_name == "환경정책과" and self._contains_any(text, ["생활쓰레기", "불법투기", "분리수거", "악취", "소음"]):
                score += 4
            if sub_name == "복지정책과" and self._contains_any(text, ["복지", "기초생활", "긴급복지", "돌봄"]):
                score += 4
            if sub_name == "도시계획과" and self._contains_any(text, ["재개발", "재건축", "불법건축", "도시계획"]):
                score += 4
            if sub_name == "감사담당관" and self._contains_any(text, ["공무원 비위", "징계", "감사", "복무", "직무태만"]):
                score += 4

        return score

    def _score_candidates(self, text: str) -> Dict[Tuple[str, str], int]:
        scores: Dict[Tuple[str, str], int] = {}

        for dept_name, dept_meta in self.rules.items():
            dept_score = 0
            for keyword in dept_meta.get("department_keywords", []):
                if keyword.lower() in text:
                    dept_score += 1

            for sub_name, sub_meta in dept_meta["sub_departments"].items():
                score = dept_score
                for keyword in sub_meta.get("keywords", []):
                    if keyword.lower() in text:
                        score += 2

                score += self._intent_boost(dept_name, sub_name, text)
                scores[(dept_name, sub_name)] = score

        return scores

    def _build_recommendations(self, text: str, scores: Dict[Tuple[str, str], int], limit: int = 3) -> List[dict]:
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        recommendations: List[dict] = []

        for (dept_name, sub_name), score in ranked[: max(1, limit)]:
            dept_meta = self.rules[dept_name]
            sub_meta = dept_meta["sub_departments"][sub_name]
            matched_keywords = self._extract_keywords(text, dept_name, sub_name)
            keyword_total = max(len(sub_meta.get("keywords", [])), 1)
            confidence = min(0.95, 0.38 + (max(score, 0) / keyword_total) * 0.58)

            reason = (
                f"{dept_meta.get('legal_reference')} 및 {sub_name} 소관사무({sub_meta.get('reason')})를 기준으로 "
                f"민원 핵심어를 매칭해 추천했습니다."
            )

            recommendations.append(
                {
                    "department": dept_name,
                    "sub_department": sub_name,
                    "department_code": dept_meta.get("code"),
                    "sub_department_code": sub_meta.get("code"),
                    "department_score": float(confidence),
                    "sub_department_score": float(confidence),
                    "overall_score": float(confidence),
                    "classification_basis": {
                        "keywords": matched_keywords,
                        "legal_basis": dept_meta.get("legal_reference"),
                        "policy_basis": sub_meta.get("reason"),
                        "reason": reason,
                    },
                }
            )

        return recommendations

    def _pick_best(self, scores: Dict[Tuple[str, str], int]) -> Tuple[str, str, int]:
        best = (self.default_department, self.default_sub_department)
        best_score = -1

        for key, score in scores.items():
            if score > best_score:
                best = key
                best_score = score

        return best[0], best[1], max(best_score, 0)

    def _extract_keywords(self, text: str, dept: str, sub_dept: str) -> List[str]:
        keywords = self.rules[dept]["sub_departments"][sub_dept].get("keywords", [])
        return [kw for kw in keywords if kw.lower() in text][:8]

    def classify(self, title: str, content: str) -> dict:
        text = self._normalize_text(f"{title} {content}")
        scores = self._score_candidates(text)

        dept_name, sub_name, best_score = self._pick_best(scores)
        is_non_actionable, non_actionable_reason, matched_private = self._check_non_actionable(text, best_score)
        if is_non_actionable:
            return self._build_non_actionable_result(non_actionable_reason, matched_private)

        dept_meta = self.rules[dept_name]
        sub_meta = dept_meta["sub_departments"][sub_name]

        matched_keywords = self._extract_keywords(text, dept_name, sub_name)
        keyword_total = max(len(sub_meta.get("keywords", [])), 1)
        confidence = min(0.95, 0.38 + (best_score / keyword_total) * 0.58)

        reason = (
            f"{dept_meta.get('legal_reference')} 및 {sub_name} 소관사무({sub_meta.get('reason')})를 기준으로 "
            f"민원 핵심어를 매칭해 추천했습니다."
        )

        return {
            "department": dept_name,
            "sub_department": sub_name,
            "department_code": dept_meta.get("code"),
            "sub_department_code": sub_meta.get("code"),
            "department_score": float(confidence),
            "sub_department_score": float(confidence),
            "overall_score": float(confidence),
            "classification_basis": {
                "keywords": matched_keywords,
                "legal_basis": dept_meta.get("legal_reference"),
                "policy_basis": sub_meta.get("reason"),
                "reason": reason,
            },
        }

    def classify_top_n(self, title: str, content: str, limit: int = 3) -> List[dict]:
        text = self._normalize_text(f"{title} {content}")
        scores = self._score_candidates(text)
        _, _, best_score = self._pick_best(scores)

        is_non_actionable, non_actionable_reason, matched_private = self._check_non_actionable(text, best_score)
        if is_non_actionable:
            return [self._build_non_actionable_result(non_actionable_reason, matched_private)]

        return self._build_recommendations(text, scores, limit=limit)

    def generate_content_summary(self, title: str, content: str, dept: str = None, sub_dept: str = None) -> str:
        text = re.sub(r"\s+", " ", content or "").strip()
        if not text:
            return f"[{title}] 내용 없음"

        # 문장/절 단위로 분해해서 핵심 쟁점과 요청사항을 분리
        clauses = [c.strip() for c in re.split(r"[.!?\n]|다\.", text) if c.strip()]
        issue_source = clauses[0] if clauses else text
        issue = issue_source[:65] + ("..." if len(issue_source) > 65 else "")

        request_markers = ["요청", "처리", "검토", "확인", "조치", "단속", "회신", "답변", "바랍니다", "해주세요"]
        request = ""
        for marker in request_markers:
            idx = text.find(marker)
            if idx >= 0:
                left = max(0, idx - 24)
                right = min(len(text), idx + 30)
                request = text[left:right].strip()
                break

        pieces = [f"[{title}] 핵심쟁점: {issue}"]
        if request:
            pieces.append(f"요청사항: {request}")
        if dept and sub_dept:
            pieces.append(f"권장배정: {dept} {sub_dept}")

        summary = " / ".join(pieces)
        return summary[:220] + ("..." if len(summary) > 220 else "")


classification_engine = ComplaintClassificationEngine()
