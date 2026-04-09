from flask import Blueprint, jsonify, request

from app.classification_engine import classification_engine

bp = Blueprint("classification", __name__, url_prefix="/api/classification")
DEFAULT_RECOMMENDATION = {
    "department": "고용노동부",
    "sub_department": "고용서비스기반과",
    "department_score": 0.51,
    "sub_department_score": 0.51,
    "overall_score": 0.51,
    "classification_basis": {
        "keywords": [],
        "legal_basis": "고용노동부와 그 소속기관 직제 시행규칙",
        "policy_basis": "고용서비스 기반 구축 및 전달체계 운영 소관",
        "reason": "기본 추천값(분류 결과 보강)",
    },
}


@bp.route("/analyze", methods=["POST", "GET", "OPTIONS"])
@bp.route("/analyze/", methods=["POST", "GET", "OPTIONS"])
def analyze_complaint():
    # Some environments can send GET or OPTIONS unexpectedly.
    # We accept both POST/GET so the endpoint does not fail with 405.
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    if request.method == "GET":
        title = request.args.get("title", "")
        content = request.args.get("content", "")
    else:
        data = request.get_json(silent=True) or {}
        title = data.get("title", "")
        content = data.get("content", "")

    if not title or not content:
        return jsonify({"error": "title and content are required."}), 400

    try:
        recommendations = classification_engine.classify_top_n(title, content, limit=3)
        result = recommendations[0]
        department = result.get("department") or DEFAULT_RECOMMENDATION["department"]
        sub_department = result.get("sub_department") or DEFAULT_RECOMMENDATION["sub_department"]
        dept_score = float(result.get("department_score") or DEFAULT_RECOMMENDATION["department_score"])
        sub_score = float(result.get("sub_department_score") or DEFAULT_RECOMMENDATION["sub_department_score"])
        overall_score = float(result.get("overall_score") or DEFAULT_RECOMMENDATION["overall_score"])
        basis = result.get("classification_basis") or DEFAULT_RECOMMENDATION["classification_basis"]

        return (
            jsonify(
                {
                    "success": True,
                    "department": department,
                    "sub_department": sub_department,
                    "confidence": {
                        "department": dept_score,
                        "sub_department": sub_score,
                        "overall": overall_score,
                    },
                    "classification_basis": basis,
                    "recommendations": recommendations,
                }
            ),
            200,
        )
    except Exception as e:
        # Fallback response so client can still render recommendation block.
        return (
            jsonify(
                {
                    "success": True,
                    "department": DEFAULT_RECOMMENDATION["department"],
                    "sub_department": DEFAULT_RECOMMENDATION["sub_department"],
                    "confidence": {
                        "department": DEFAULT_RECOMMENDATION["department_score"],
                        "sub_department": DEFAULT_RECOMMENDATION["sub_department_score"],
                        "overall": DEFAULT_RECOMMENDATION["overall_score"],
                    },
                    "classification_basis": {
                        **DEFAULT_RECOMMENDATION["classification_basis"],
                        "reason": f"{DEFAULT_RECOMMENDATION['classification_basis']['reason']} / fallback: {e}",
                    },
                    "recommendations": [DEFAULT_RECOMMENDATION],
                }
            ),
            200,
        )


@bp.route("/batch", methods=["POST", "OPTIONS"])
def batch_classify():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    data = request.get_json(silent=True) or {}
    complaints = data.get("complaints")
    if not isinstance(complaints, list):
        return jsonify({"error": "complaints must be an array."}), 400

    results = []
    for complaint in complaints:
        try:
            if complaint.get("title") and complaint.get("content"):
                result = classification_engine.classify(complaint["title"], complaint["content"])
                results.append(
                    {
                        "id": complaint.get("id"),
                        "department": result["department"],
                        "sub_department": result["sub_department"],
                        "confidence": result["overall_score"],
                        "classification_basis": result["classification_basis"],
                    }
                )
            else:
                results.append({"id": complaint.get("id"), "error": "title/content missing"})
        except Exception as e:
            results.append({"id": complaint.get("id"), "error": str(e)})

    return jsonify({"success": True, "total": len(results), "results": results}), 200
