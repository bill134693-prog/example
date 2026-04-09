from __future__ import annotations

from typing import Dict


GUIDELINE_SUMMARY = [
    "민원 요지를 먼저 명확히 정리하고 사실관계를 기준으로 답변한다.",
    "소관기관/처리절차/처리기한 또는 진행상황을 구체적으로 안내한다.",
    "법령·규정 근거를 가능한 범위에서 쉬운 문장으로 제시한다.",
    "민원인 개인정보 및 제3자 정보는 답변에 노출하지 않는다.",
    "소관이 아닌 경우 불수리 취지보다 이송·안내 중심으로 설명한다.",
]


def _build_non_actionable_reply(title: str, content: str) -> str:
    summary = (content or "").strip().replace("\n", " ")
    summary = summary[:90] + ("..." if len(summary) > 90 else "")
    return (
        "1. 안녕하십니까? 귀하께서 국민신문고를 통해 신청하신 민원에 대한 검토 결과를 다음과 같이 알려드립니다.\n\n"
        f"2. 귀하께서 제출하신 민원의 내용은 \"{summary}\"에 관한 것으로 이해됩니다.\n\n"
        "3. 귀하의 민원에 대한 검토 결과는 다음과 같습니다.\n"
        "   가. 현재 작성된 내용만으로는 행정기관이 처리하는 민원(민원 처리에 관한 법률 제2조) 해당 여부 판단이 어렵습니다.\n"
        "   나. 사인 간 분쟁 또는 사실관계 불명확 사안은 행정민원으로 직접 처리가 제한될 수 있어, 대상 기관·발생 시점·요청사항 보완이 필요합니다.\n\n"
        "4. 답변 내용에 대한 추가 설명이 필요한 경우 소관 부서 담당자에게 연락주시면 안내해 드리겠습니다. 감사합니다."
    )


def generate_ai_answer_suggestion(complaint: Dict) -> Dict:
    complaint_id = complaint.get("complaint_id") or "1AA-0000-000000"
    title = (complaint.get("title") or "").strip()
    content = (complaint.get("content") or "").strip()
    department = complaint.get("department") or "-"
    sub_department = complaint.get("sub_department") or "-"

    is_non_actionable = str(department).startswith("추천 어려움")
    if is_non_actionable:
        suggestion = _build_non_actionable_reply(title, content)
        return {
            "suggested_answer": suggestion,
            "basis": [
                "민원 처리에 관한 법률 제2조(민원의 정의)",
                "부패방지 및 국민권익위원회의 설치와 운영에 관한 법률 제12조",
                "국민신문고 민원처리시 준수사항(4차 개정): 소관/처리 가능 여부 및 안내 중심 응대",
            ],
            "guidelines_applied": GUIDELINE_SUMMARY,
        }

    summary = content.replace("\n", " ").strip()
    summary = summary[:90] + ("..." if len(summary) > 90 else "")
    suggestion = (
        f"1. 안녕하십니까? 귀하께서 국민신문고를 통해 신청하신 민원(신청번호 {complaint_id})에 대한 검토 결과를 다음과 같이 알려드립니다.\n\n"
        f"2. 귀하께서 제출하신 민원의 내용은 \"{summary}\"에 관한 것으로 이해(또는 판단) 됩니다.\n\n"
        "3. 귀하의 민원에 대한 검토 결과는 다음과 같습니다.\n"
        f"   가. 본 건은 {department} {sub_department} 소관으로 검토하였습니다.\n"
        "   나. 관련 법령 및 내부 처리기준에 따라 사실관계를 확인 중이며, 확인 결과에 따라 필요한 조치를 진행하겠습니다.\n\n"
        "4. 답변 내용에 대한 추가 설명이 필요한 경우 소관 부서 담당자에게 연락주시면 친절히 안내해 드리도록 하겠습니다. 감사합니다."
    )

    return {
        "suggested_answer": suggestion,
        "basis": [
            "민원 처리에 관한 법률(민원 처리 절차 및 통지 취지)",
            "부패방지 및 국민권익위원회의 설치와 운영에 관한 법률 제12조",
            "국민신문고 민원처리시 준수사항(4차 개정): 사실관계 중심, 처리결과·진행상황 안내, 개인정보 보호",
        ],
        "guidelines_applied": GUIDELINE_SUMMARY,
    }
