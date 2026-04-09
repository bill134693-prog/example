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
    return (
        "안녕하세요. 접수하신 내용에 대해 확인한 결과, 현재 작성 내용만으로는 "
        "행정기관이 처리하는 민원(민원 처리에 관한 법률 제2조)에 해당하는지 판단이 어렵습니다.\n\n"
        "특히 사인 간 분쟁 또는 사실관계가 불명확한 경우에는 행정민원으로 직접 처리하기 어려울 수 있습니다.\n"
        "아래 사항을 보완해 주시면 소관기관 검토에 도움이 됩니다.\n"
        "1. 대상 기관(예: ○○시청, ○○부처, ○○공공기관)\n"
        "2. 발생 시점/장소와 경위\n"
        "3. 행정기관에 요청하는 구체적 조치\n\n"
        "필요시 법률구조공단, 대한법률구조공단 상담 또는 관할 기관 민원창구를 통해 "
        "권리구제 절차를 안내받으시기 바랍니다."
    )


def generate_ai_answer_suggestion(complaint: Dict) -> Dict:
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

    summary = content[:220] + ("..." if len(content) > 220 else "")
    suggestion = (
        "안녕하세요. 귀하께서 접수하신 민원에 대해 검토한 결과를 안내드립니다.\n\n"
        f"1. 민원 요지\n- {title}\n- {summary}\n\n"
        f"2. 검토 부서\n- {department} {sub_department}\n\n"
        "3. 검토 결과 및 조치 계획\n"
        "- 관련 법령 및 내부 처리기준에 따라 사실관계를 확인하고 있습니다.\n"
        "- 추가 확인이 필요한 사항은 별도 연락드리며, 확인 즉시 처리결과를 안내드리겠습니다.\n"
        "- 소관이 일부 상이할 경우 관계 기관으로 이송 또는 협조 요청 후 진행상황을 통지하겠습니다.\n\n"
        "4. 안내사항\n"
        "- 개인정보 보호를 위해 민감한 정보는 답변서에 기재하지 않았습니다.\n"
        "- 본 답변은 현재 확인된 범위 기준이며, 추가 자료에 따라 보완될 수 있습니다.\n\n"
        "감사합니다."
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

