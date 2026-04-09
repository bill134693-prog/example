from flask import Blueprint, jsonify, request

from app.classification_engine import classification_engine

bp = Blueprint("classification", __name__, url_prefix="/api/classification")


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
        result = classification_engine.classify(title, content)
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
