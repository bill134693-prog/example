import re
from typing import List


class DuplicateDetector:
    """Simple duplicate detector without heavy ML dependencies."""

    def __init__(self, similarity_threshold: float = 0.6):
        self.similarity_threshold = similarity_threshold

    @staticmethod
    def _tokenize(text: str) -> set:
        cleaned = re.sub(r"[^0-9a-zA-Z가-힣\s]", " ", text or "").lower()
        return {token for token in cleaned.split() if len(token) > 1}

    def calculate_similarity(self, text1: str, text2: str) -> float:
        tokens1 = self._tokenize(text1)
        tokens2 = self._tokenize(text2)
        if not tokens1 and not tokens2:
            return 0.0
        union = tokens1 | tokens2
        if not union:
            return 0.0
        return float(len(tokens1 & tokens2) / len(union))

    def find_similar_complaints(self, current_complaint: dict, historical_complaints: List[dict]) -> List[dict]:
        similar_complaints = []
        current_text = f"{current_complaint.get('title', '')} {current_complaint.get('content', '')}"
        current_citizen_id = current_complaint.get("citizen_id", "")

        for complaint in historical_complaints:
            if current_citizen_id != complaint.get("citizen_id", ""):
                continue

            hist_text = f"{complaint.get('title', '')} {complaint.get('content', '')}"
            similarity = self.calculate_similarity(current_text, hist_text)

            if similarity >= self.similarity_threshold:
                similar_complaints.append(
                    {
                        "id": complaint.get("id"),
                        "similarity_score": similarity,
                        "title": complaint.get("title"),
                        "content": complaint.get("content"),
                        "created_at": complaint.get("created_at"),
                        "department": complaint.get("department"),
                        "sub_department": complaint.get("sub_department"),
                    }
                )

        similar_complaints.sort(key=lambda x: x["similarity_score"], reverse=True)
        return similar_complaints

    def get_duplicate_alert_message(self, similarity_score: float, similar_count: int) -> dict:
        if similarity_score >= 0.8:
            level = "높음"
            message = f"매우 유사한 민원이 {similar_count}건 발견되었습니다. 반복민원에 해당합니다."
        elif similarity_score >= 0.6:
            level = "중간"
            message = f"유사한 민원이 {similar_count}건 발견되었습니다. 반복민원 검토가 필요합니다."
        else:
            level = "낮음"
            message = f"유사 민원이 {similar_count}건 발견되었습니다."

        return {
            "alert_level": level,
            "message": message,
            "requires_review": similarity_score >= 0.6,
        }

    def batch_find_duplicates(self, new_complaint: dict, historical_complaints: List[dict]) -> dict:
        similar = self.find_similar_complaints(new_complaint, historical_complaints)
        is_duplicate = len(similar) > 0

        if similar:
            max_similarity = similar[0]["similarity_score"]
            alert_info = self.get_duplicate_alert_message(max_similarity, len(similar))
        else:
            alert_info = {
                "alert_level": "없음",
                "message": "유사한 민원이 발견되지 않았습니다.",
                "requires_review": False,
            }

        return {
            "is_duplicate": is_duplicate,
            "alert_level": alert_info["alert_level"],
            "similar_complaints": similar,
            "alert_message": alert_info["message"],
            "requires_immediate_action": alert_info.get("requires_review", False),
            "similarity_details": {
                "threshold": self.similarity_threshold,
                "top_score": similar[0]["similarity_score"] if similar else 0.0,
                "similar_count": len(similar),
            },
        }


duplicate_detector = DuplicateDetector(similarity_threshold=0.6)
