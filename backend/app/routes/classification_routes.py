from flask import Blueprint, jsonify, request

from app.classification_engine import classification_engine

bp = Blueprint("classification", __name__, url_prefix="/api/classification")


@bp.route("/analyze", methods=["POST"])
def analyze_complaint():
    data = request.get_json(silent=True) or {}
    if not data.get("title") or not data.get("content"):
        return jsonify({"error": "title과 content는 필수입니다."}), 400

    try:
        result = classification_engine.classify(data["title"], data["content"])
        return (
            jsonify(
                {
                    "success": True,
                    "department": result["department"],
                    "sub_department": result["sub_department"],
                    "confidence": {
                        "department": result["department_score"],
                        "sub_department": result["sub_department_score"],
                        "overall": result["overall_score"],
                    },
                    "classification_basis": result["classification_basis"],
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/batch", methods=["POST"])
def batch_classify():
    data = request.get_json(silent=True) or {}
    complaints = data.get("complaints")
    if not isinstance(complaints, list):
        return jsonify({"error": "complaints는 배열이어야 합니다."}), 400

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
                results.append({"id": complaint.get("id"), "error": "title/content 누락"})
        except Exception as e:
            results.append({"id": complaint.get("id"), "error": str(e)})

    return jsonify({"success": True, "total": len(results), "results": results}), 200
