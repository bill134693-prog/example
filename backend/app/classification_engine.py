import re
from typing import Dict, List, Tuple

from app.legal_basis_data import LEGAL_CLASSIFICATION_RULES


class ComplaintClassificationEngine:
    """법령(직제 시행규칙) 참고 기반 민원 분류 엔진."""

    def __init__(self) -> None:
        self.rules = LEGAL_CLASSIFICATION_RULES
        self.default_department = "국토교통부"
        self.default_sub_department = "도로과"

    @staticmethod
    def _normalize_text(text: str) -> str:
        text = text or ""
        text = re.sub(r"\s+", " ", text).strip().lower()
        return text

    def _score_candidates(self, text: str) -> Dict[Tuple[str, str], int]:
        scores: Dict[Tuple[str, str], int] = {}
        for dept_name, dept_meta in self.rules.items():
            for sub_name, sub_meta in dept_meta["sub_departments"].items():
                score = 0
                for keyword in sub_meta.get("keywords", []):
                    if keyword.lower() in text:
                        score += 1
                scores[(dept_name, sub_name)] = score
        return scores

    def _pick_best(self, scores: Dict[Tuple[str, str], int]) -> Tuple[str, str, int]:
        best_key = (self.default_department, self.default_sub_department)
        best_score = -1
        for key, score in scores.items():
            if score > best_score:
                best_key = key
                best_score = score
        return best_key[0], best_key[1], max(best_score, 0)

    def _extract_keywords(self, text: str, dept: str, sub_dept: str) -> List[str]:
        keywords = self.rules[dept]["sub_departments"][sub_dept].get("keywords", [])
        return [kw for kw in keywords if kw.lower() in text]

    def classify(self, title: str, content: str) -> dict:
        text = self._normalize_text(f"{title} {content}")

        scores = self._score_candidates(text)
        dept_name, sub_name, best_score = self._pick_best(scores)

        dept_meta = self.rules[dept_name]
        sub_meta = dept_meta["sub_departments"][sub_name]

        matched_keywords = self._extract_keywords(text, dept_name, sub_name)
        keyword_total = max(len(sub_meta.get("keywords", [])), 1)
        confidence = min(0.95, 0.40 + (best_score / keyword_total) * 0.55)

        reason = (
            f"{dept_meta.get('legal_reference')} 기준, "
            f"{sub_name} 소관({sub_meta.get('reason')})과 키워드 매칭 결과"
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

    def generate_content_summary(self, title: str, content: str, dept: str = None, sub_dept: str = None) -> str:
        sentences = [s.strip() for s in re.split(r"[.!?\n]", content or "") if s.strip()]
        first = sentences[0] if sentences else (content or "")[:120]
        summary = f"[{title}] {first}".strip()
        if len(summary) > 300:
            summary = summary[:297] + "..."
        return summary


classification_engine = ComplaintClassificationEngine()
