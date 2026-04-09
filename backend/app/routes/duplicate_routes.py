import hashlib

from flask import Blueprint, jsonify, request

from app import db
from app.duplicate_detector import duplicate_detector
from app.models import Complaint, DuplicateAlert

bp = Blueprint("duplicates", __name__, url_prefix="/api/duplicates")


def hash_citizen_id(citizen_id: str) -> str:
    return hashlib.sha256((citizen_id or "").encode("utf-8")).hexdigest()


@bp.route("/check", methods=["POST"])
def check_duplicate():
    data = request.get_json(silent=True) or {}
    if not all(data.get(f) for f in ["citizen_id", "title", "content"]):
        return jsonify({"error": "필수 필드 누락"}), 400

    try:
        hashed_citizen_id = hash_citizen_id(data["citizen_id"])
        existing = Complaint.query.filter(Complaint.citizen_id == hashed_citizen_id).all()

        historical = [
            {
                "id": c.id,
                "title": c.title,
                "content": c.content,
                "citizen_id": c.citizen_id,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "department": c.department.name if c.department else None,
                "sub_department": c.sub_department.name if c.sub_department else None,
            }
            for c in existing
        ]

        result = duplicate_detector.batch_find_duplicates(
            {"title": data["title"], "content": data["content"], "citizen_id": hashed_citizen_id},
            historical,
        )

        return (
            jsonify(
                {
                    "success": True,
                    "is_duplicate": result["is_duplicate"],
                    "alert_level": result["alert_level"],
                    "alert_message": result["alert_message"],
                    "message": result["alert_message"],
                    "requires_review": result["requires_immediate_action"],
                    "similar_complaints": [
                        {
                            "id": c["id"],
                            "title": c["title"],
                            "similarity_score": c["similarity_score"],
                            "created_at": c["created_at"],
                            "department": c.get("department"),
                            "sub_department": c.get("sub_department"),
                        }
                        for c in result["similar_complaints"]
                    ],
                    "similarity_threshold": result["similarity_details"]["threshold"],
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/alerts", methods=["GET"])
def get_duplicate_alerts():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    reviewed = request.args.get("reviewed")

    query = DuplicateAlert.query
    if reviewed is not None:
        query = query.filter_by(is_reviewed=(reviewed.lower() == "true"))

    pagination = query.order_by(DuplicateAlert.created_at.desc()).paginate(page=page, per_page=per_page)

    alerts = [
        {
            "id": alert.id,
            "complaint_id": alert.complaint_id,
            "similar_complaint_id": alert.similar_complaint_id,
            "similarity_score": alert.similarity_score,
            "alert_message": alert.alert_message,
            "is_reviewed": alert.is_reviewed,
            "created_at": alert.created_at.isoformat() if alert.created_at else None,
        }
        for alert in pagination.items
    ]

    return jsonify({"alerts": alerts, "total": pagination.total, "pages": pagination.pages, "current_page": page}), 200


@bp.route("/alerts/<int:alert_id>", methods=["PUT"])
def mark_alert_reviewed(alert_id: int):
    alert = DuplicateAlert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "알림을 찾을 수 없습니다."}), 404

    from datetime import datetime

    alert.is_reviewed = True
    alert.reviewed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"success": True, "alert_id": alert.id, "is_reviewed": alert.is_reviewed}), 200


@bp.route("/stats", methods=["GET"])
def get_duplicate_stats():
    total_alerts = DuplicateAlert.query.count()
    unreviewed = DuplicateAlert.query.filter_by(is_reviewed=False).count()
    avg_similarity = db.session.query(db.func.avg(DuplicateAlert.similarity_score)).scalar()

    return (
        jsonify(
            {
                "total_alerts": total_alerts,
                "unreviewed_alerts": unreviewed,
                "reviewed_alerts": total_alerts - unreviewed,
                "average_similarity": float(avg_similarity) if avg_similarity else 0.0,
            }
        ),
        200,
    )
