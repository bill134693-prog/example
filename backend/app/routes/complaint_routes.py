import hashlib
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request

from app.ai_answer_engine import generate_ai_answer_suggestion
from app import db
from app.classification_engine import classification_engine
from app.duplicate_detector import duplicate_detector
from app.models import (
    Classification,
    Complaint,
    ComplaintStatus,
    Department,
    DuplicateAlert,
    ProcessingHistory,
    SubDepartment,
)

bp = Blueprint("complaints", __name__, url_prefix="/api/complaints")


def hash_citizen_id(citizen_id: str) -> str:
    return hashlib.sha256((citizen_id or "").encode("utf-8")).hexdigest()


def generate_receipt_number() -> str:
    # 접수번호 규칙: 1AA-YYMM-###### (전자접수/연월/월별 순번)
    now_kst = datetime.utcnow() + timedelta(hours=9)
    yymm = now_kst.strftime("%y%m")
    prefix = f"1AA-{yymm}-"
    monthly_count = Complaint.query.filter(Complaint.complaint_id.like(f"{prefix}%")).count()
    sequence = monthly_count + 1
    return f"{prefix}{sequence:06d}"


def _serialize_complaint_row(complaint: Complaint) -> dict:
    remaining_days = None
    if complaint.due_date:
        remaining_days = (complaint.due_date - datetime.utcnow()).days

    return {
        "id": complaint.id,
        "complaint_id": complaint.complaint_id,
        "citizen_name": complaint.citizen_name,
        "title": complaint.title,
        "status": complaint.status,
        "department": complaint.department.name if complaint.department else None,
        "sub_department": complaint.sub_department.name if complaint.sub_department else None,
        "is_duplicate": complaint.is_duplicate,
        "repeat_count": complaint.repeat_count,
        "received_date": complaint.received_date.isoformat() if complaint.received_date else None,
        "due_date": complaint.due_date.isoformat() if complaint.due_date else None,
        "remaining_days": remaining_days,
        "classification_score": complaint.classification_score,
        "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
    }


@bp.route("", methods=["POST", "OPTIONS"])
@bp.route("/", methods=["POST", "OPTIONS"])
def create_complaint():
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200

    data = request.get_json(silent=True) or {}

    required_fields = ["citizen_id", "citizen_name", "title", "content"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"error": f"?꾩닔 ?꾨뱶 ?꾨씫: {', '.join(missing)}"}), 400

    try:
        complaint = Complaint(
            complaint_id=generate_receipt_number(),
            citizen_id=hash_citizen_id(data["citizen_id"]),
            citizen_name=data["citizen_name"],
            citizen_phone=data.get("citizen_phone", ""),
            citizen_address=data.get("citizen_address", ""),
            title=data["title"],
            content=data["content"],
            status=ComplaintStatus.RECEIVED.value,
            received_date=datetime.utcnow(),
            due_date=datetime.utcnow() + timedelta(days=60),
        )

        db.session.add(complaint)
        db.session.flush()

        classification_result = classification_engine.classify(complaint.title, complaint.content)
        preferred_department = (data.get("preferred_department") or "").strip()
        preferred_sub_department = (data.get("preferred_sub_department") or "").strip()
        preferred_reason = (data.get("preferred_reason") or "").strip()
        preferred_confidence = data.get("preferred_confidence")
        if preferred_department and preferred_sub_department:
            classification_result = {
                **classification_result,
                "department": preferred_department,
                "sub_department": preferred_sub_department,
                "overall_score": float(preferred_confidence) if preferred_confidence is not None else classification_result["overall_score"],
                "department_score": float(preferred_confidence) if preferred_confidence is not None else classification_result["department_score"],
                "sub_department_score": float(preferred_confidence) if preferred_confidence is not None else classification_result["sub_department_score"],
                "classification_basis": {
                    **classification_result.get("classification_basis", {}),
                    "reason": preferred_reason or classification_result.get("classification_basis", {}).get("reason", ""),
                },
            }
        complaint.content_summary = classification_engine.generate_content_summary(
            complaint.title,
            complaint.content,
            classification_result["department"],
            classification_result["sub_department"],
        )

        dept = Department.query.filter_by(name=classification_result["department"]).first()
        if not dept and classification_result.get("department_code"):
            dept = Department.query.filter_by(code=classification_result["department_code"]).first()

        if dept:
            complaint.department_id = dept.id
            sub_dept = SubDepartment.query.filter_by(
                department_id=dept.id,
                name=classification_result["sub_department"],
            ).first()
            if not sub_dept and classification_result.get("sub_department_code"):
                sub_dept = SubDepartment.query.filter_by(
                    department_id=dept.id,
                    code=classification_result["sub_department_code"],
                ).first()
            if sub_dept:
                complaint.sub_department_id = sub_dept.id

        complaint.classification_score = classification_result["overall_score"]
        complaint.status = ComplaintStatus.CLASSIFIED.value

        one_year_ago = datetime.utcnow() - timedelta(days=365)
        complaint.repeat_count = Complaint.query.filter(
            Complaint.citizen_id == complaint.citizen_id,
            Complaint.created_at >= one_year_ago,
            Complaint.id != complaint.id,
        ).count()

        reasoning_basis = classification_result.get("classification_basis", {})
        reasoning_text = (
            f"踰뺤쟻洹쇨굅: {reasoning_basis.get('legal_basis', '-')}; "
            f"?뺤콉洹쇨굅: {reasoning_basis.get('policy_basis', '-')}; "
            f"留ㅼ묶?ㅼ썙?? {', '.join(reasoning_basis.get('keywords', [])) or '-'}"
        )

        db.session.add(
            Classification(
                complaint_id=complaint.id,
                predicted_department=classification_result["department"],
                predicted_sub_department=classification_result["sub_department"],
                prediction_score=classification_result["overall_score"],
                reasoning=reasoning_text,
            )
        )

        historical_complaints = Complaint.query.filter(
            Complaint.citizen_id == complaint.citizen_id,
            Complaint.id != complaint.id,
        ).all()

        historical_payload = [
            {
                "id": c.id,
                "title": c.title,
                "content": c.content,
                "citizen_id": c.citizen_id,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "department": c.department.name if c.department else None,
                "sub_department": c.sub_department.name if c.sub_department else None,
            }
            for c in historical_complaints
        ]

        duplicate_result = duplicate_detector.batch_find_duplicates(
            {
                "id": complaint.id,
                "title": complaint.title,
                "content": complaint.content,
                "citizen_id": complaint.citizen_id,
            },
            historical_payload,
        )

        if duplicate_result["is_duplicate"]:
            complaint.is_duplicate = True
            complaint.status = ComplaintStatus.DUPLICATE_ALERT.value
            for item in duplicate_result["similar_complaints"]:
                db.session.add(
                    DuplicateAlert(
                        complaint_id=complaint.id,
                        similar_complaint_id=item["id"],
                        similarity_score=item["similarity_score"],
                        alert_message=duplicate_result["alert_message"],
                    )
                )

        db.session.commit()

        return (
            jsonify(
                {
                    "success": True,
                    "complaint_id": complaint.complaint_id,
                    "id": complaint.id,
                    "classification": {
                        "department": classification_result["department"],
                        "sub_department": classification_result["sub_department"],
                        "score": classification_result["overall_score"],
                    },
                    "duplicate_alert": {
                        "is_duplicate": duplicate_result["is_duplicate"],
                        "alert_level": duplicate_result["alert_level"],
                        "message": duplicate_result["alert_message"],
                        "similar_count": duplicate_result["similarity_details"]["similar_count"],
                    },
                }
            ),
            201,
        )
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/submit", methods=["POST", "OPTIONS"])
def submit_complaint():
    # Dedicated endpoint to avoid environment-specific 405 issues on /complaints or /complaints/
    return create_complaint()


@bp.route("/<int:complaint_id>", methods=["GET"])
def get_complaint(complaint_id: int):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    remaining_days = None
    if complaint.due_date:
        remaining_days = (complaint.due_date - datetime.utcnow()).days

    history = ProcessingHistory.query.filter_by(complaint_id=complaint_id).order_by(ProcessingHistory.created_at.desc()).all()
    alerts = DuplicateAlert.query.filter_by(complaint_id=complaint_id).all()

    return jsonify(
        {
            "id": complaint.id,
            "complaint_id": complaint.complaint_id,
            "citizen_name": complaint.citizen_name,
            "citizen_phone": complaint.citizen_phone,
            "citizen_address": complaint.citizen_address,
            "title": complaint.title,
            "content": complaint.content,
            "content_summary": complaint.content_summary,
            "status": complaint.status,
            "department": complaint.department.name if complaint.department else None,
            "sub_department": complaint.sub_department.name if complaint.sub_department else None,
            "is_duplicate": complaint.is_duplicate,
            "classification_score": complaint.classification_score,
            "received_date": complaint.received_date.isoformat() if complaint.received_date else None,
            "due_date": complaint.due_date.isoformat() if complaint.due_date else None,
            "remaining_days": remaining_days,
            "response_date": complaint.response_date.isoformat() if complaint.response_date else None,
            "response_content": complaint.response_content,
            "handler_id": complaint.handler_id,
            "duplicate_info": {
                "is_duplicate": complaint.is_duplicate,
                "alert_sent": complaint.duplicate_alert_sent,
                "repeat_count": complaint.repeat_count,
                "similar_complaints": [
                    {
                        "similarity_score": a.similarity_score,
                        "alert_message": a.alert_message,
                    }
                    for a in alerts
                ],
            },
            "processing_history": [
                {
                    "action_type": h.action_type,
                    "action_by": h.action_by,
                    "action_description": h.action_description,
                    "status_before": h.status_before,
                    "status_after": h.status_after,
                    "created_at": h.created_at.isoformat() if h.created_at else None,
                }
                for h in history
            ],
            "created_at": complaint.created_at.isoformat() if complaint.created_at else None,
        }
    ), 200


@bp.route("/", methods=["GET"])
def list_complaints():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    status = request.args.get("status")
    department_id = request.args.get("department_id", type=int)

    query = Complaint.query
    if status:
        query = query.filter_by(status=status)
    if department_id:
        query = query.filter_by(department_id=department_id)

    pagination = query.order_by(Complaint.created_at.desc()).paginate(page=page, per_page=per_page)

    return (
        jsonify(
            {
                "complaints": [_serialize_complaint_row(c) for c in pagination.items],
                "total": pagination.total,
                "pages": pagination.pages,
                "current_page": page,
                "per_page": per_page,
            }
        ),
        200,
    )


@bp.route("/<int:complaint_id>", methods=["PUT"])
def update_complaint(complaint_id: int):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    data = request.get_json(silent=True) or {}
    if "status" in data:
        complaint.status = data["status"]
    db.session.commit()

    return jsonify({"success": True, "complaint_id": complaint.complaint_id, "status": complaint.status}), 200


def _add_processing_history(complaint: Complaint, action_type: str, action_by: str, action_description: str, status_before: str):
    db.session.add(
        ProcessingHistory(
            complaint_id=complaint.id,
            action_type=action_type,
            action_by=action_by,
            action_description=action_description,
            status_before=status_before,
            status_after=complaint.status,
            department_before=complaint.department.name if complaint.department else None,
            department_after=complaint.department.name if complaint.department else None,
        )
    )


@bp.route("/<int:complaint_id>/answer", methods=["PUT", "POST", "OPTIONS"])
@bp.route("/<int:complaint_id>/answer/", methods=["PUT", "POST", "OPTIONS"])
def answer_complaint(complaint_id: int):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    data = request.get_json(silent=True) or {}
    if not data.get("response_content") or not data.get("handler_id"):
        return jsonify({"error": "response_content? handler_id媛 ?꾩슂?⑸땲??"}), 400

    status_before = complaint.status
    complaint.response_content = data["response_content"]
    complaint.response_date = datetime.utcnow()
    complaint.handler_id = data["handler_id"]
    complaint.status = ComplaintStatus.RESPONSE_COMPLETED.value

    _add_processing_history(complaint, "?듬?", data["handler_id"], data["response_content"], status_before)
    db.session.commit()
    return jsonify({"success": True, "status": complaint.status}), 200


@bp.route("/<int:complaint_id>/ai-answer-suggestion", methods=["GET", "POST"])
def get_ai_answer_suggestion(complaint_id: int):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "민원을 찾을 수 없습니다."}), 404

    payload = {
        "id": complaint.id,
        "title": complaint.title,
        "content": complaint.content,
        "department": complaint.department.name if complaint.department else None,
        "sub_department": complaint.sub_department.name if complaint.sub_department else None,
    }
    suggestion = generate_ai_answer_suggestion(payload)
    return jsonify({"success": True, **suggestion}), 200


@bp.route("/<int:complaint_id>/close", methods=["PUT", "POST", "OPTIONS"])
@bp.route("/<int:complaint_id>/close/", methods=["PUT", "POST", "OPTIONS"])
def close_complaint(complaint_id: int):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    data = request.get_json(silent=True) or {}
    if not data.get("handler_id"):
        return jsonify({"error": "handler_id媛 ?꾩슂?⑸땲??"}), 400

    status_before = complaint.status
    complaint.status = ComplaintStatus.CLOSED.value

    _add_processing_history(
        complaint,
        "醫낃껐",
        data["handler_id"],
        data.get("close_reason", "誘쇱썝 醫낃껐 泥섎━"),
        status_before,
    )
    db.session.commit()
    return jsonify({"success": True, "status": complaint.status}), 200


@bp.route("/<int:complaint_id>/withdraw", methods=["PUT", "POST", "OPTIONS"])
@bp.route("/<int:complaint_id>/withdraw/", methods=["PUT", "POST", "OPTIONS"])
def withdraw_complaint(complaint_id: int):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    data = request.get_json(silent=True) or {}
    if not data.get("handler_id"):
        return jsonify({"error": "handler_id媛 ?꾩슂?⑸땲??"}), 400

    status_before = complaint.status
    complaint.status = ComplaintStatus.WITHDRAWN.value

    _add_processing_history(
        complaint,
        "痍⑦븯",
        data["handler_id"],
        data.get("reason", "誘쇱썝 痍⑦븯 泥섎━"),
        status_before,
    )
    db.session.commit()
    return jsonify({"success": True, "status": complaint.status}), 200


@bp.route("/<int:complaint_id>/transfer", methods=["PUT", "POST", "OPTIONS"])
@bp.route("/<int:complaint_id>/transfer/", methods=["PUT", "POST", "OPTIONS"])
def transfer_complaint(complaint_id: int):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    data = request.get_json(silent=True) or {}
    if not data.get("handler_id") or not data.get("target_department"):
        return jsonify({"error": "handler_id? target_department媛 ?꾩슂?⑸땲??"}), 400

    status_before = complaint.status
    complaint.status = ComplaintStatus.TRANSFERRED.value

    _add_processing_history(
        complaint,
        "?댁넚",
        data["handler_id"],
        f"{data['target_department']}濡??댁넚",
        status_before,
    )
    db.session.commit()
    return jsonify({"success": True, "status": complaint.status, "transferred_to": data["target_department"]}), 200


@bp.route("/<int:complaint_id>/reassign", methods=["PUT", "POST", "OPTIONS"])
@bp.route("/<int:complaint_id>/reassign/", methods=["PUT", "POST", "OPTIONS"])
def reassign_complaint(complaint_id: int):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    data = request.get_json(silent=True) or {}
    required = ["handler_id", "target_department_id", "target_sub_department_id"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "?꾩닔 ?꾨뱶 ?꾨씫"}), 400

    target_dept = Department.query.get(data["target_department_id"])
    target_sub_dept = SubDepartment.query.get(data["target_sub_department_id"])
    if not target_dept or not target_sub_dept:
        return jsonify({"error": "???遺泥?遺?쒕? 李얠쓣 ???놁뒿?덈떎."}), 404

    status_before = complaint.status
    complaint.department_id = target_dept.id
    complaint.sub_department_id = target_sub_dept.id

    _add_processing_history(
        complaint,
        "?ъ???,
        data["handler_id"],
        f"{target_dept.name} > {target_sub_dept.name}濡??ъ???,
        status_before,
    )

    db.session.commit()
    return (
        jsonify(
            {
                "success": True,
                "complaint_id": complaint.complaint_id,
                "new_department": target_dept.name,
                "new_sub_department": target_sub_dept.name,
            }
        ),
        200,
    )


@bp.route("/<int:complaint_id>/reassign-suggestions", methods=["POST", "GET", "OPTIONS"])
@bp.route("/<int:complaint_id>/reassign-suggestions/", methods=["POST", "GET", "OPTIONS"])
def get_reassign_suggestions(complaint_id: int):
    if request.method == "OPTIONS":
        return jsonify({"success": True}), 200
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({"error": "誘쇱썝??李얠쓣 ???놁뒿?덈떎."}), 404

    classification_results = classification_engine.classify_top_n(complaint.title, complaint.content, limit=3)
    suggestions = []
    rank = 1
    for classification_result in classification_results:
        suggested_dept = Department.query.filter_by(name=classification_result["department"]).first()
        suggested_sub = None
        if suggested_dept:
            suggested_sub = SubDepartment.query.filter_by(
                department_id=suggested_dept.id,
                name=classification_result["sub_department"],
            ).first()

        if suggested_dept and suggested_sub:
            suggestions.append(
                {
                    "rank": rank,
                    "department_id": suggested_dept.id,
                    "department_name": suggested_dept.name,
                    "sub_department_id": suggested_sub.id,
                    "sub_department_name": suggested_sub.name,
                    "confidence": classification_result["overall_score"],
                    "reason": classification_result.get("classification_basis", {}).get("reason", "민원 내용 기반 자동 분류 결과"),
                }
            )
            rank += 1

    all_depts = Department.query.all()
    available_departments = []
    for dept in all_depts:
        sub_depts = SubDepartment.query.filter_by(department_id=dept.id).all()
        available_departments.append(
            {
                "id": dept.id,
                "name": dept.name,
                "sub_departments": [{"id": s.id, "name": s.name, "keywords": s.keywords} for s in sub_depts],
            }
        )

    return (
        jsonify(
            {
                "suggestions": suggestions,
                "available_departments": available_departments,
                "current_department": complaint.department.name if complaint.department else None,
                "current_sub_department": complaint.sub_department.name if complaint.sub_department else None,
            }
        ),
        200,
    )


@bp.route("/stats/<int:department_id>", methods=["GET"])
def get_department_stats(department_id: int):
    dept = Department.query.get(department_id)
    if not dept:
        return jsonify({"error": "遺泥섎? 李얠쓣 ???놁뒿?덈떎."}), 404

    status_values = [
        ComplaintStatus.RECEIVED.value,
        ComplaintStatus.CLASSIFIED.value,
        ComplaintStatus.PROCESSING.value,
        ComplaintStatus.RESPONSE_COMPLETED.value,
        ComplaintStatus.CLOSED.value,
        ComplaintStatus.WITHDRAWN.value,
        ComplaintStatus.TRANSFERRED.value,
        ComplaintStatus.DUPLICATE_ALERT.value,
    ]

    status_counts = {}
    for status in status_values:
        count = Complaint.query.filter_by(department_id=department_id, status=status).count()
        if count > 0:
            status_counts[status] = count

    total_complaints = Complaint.query.filter_by(department_id=department_id).count()
    duplicate_count = Complaint.query.filter_by(department_id=department_id, is_duplicate=True).count()
    avg_score = db.session.query(db.func.avg(Complaint.classification_score)).filter_by(department_id=department_id).scalar()

    return (
        jsonify(
            {
                "department": dept.name,
                "total_complaints": total_complaints,
                "status_breakdown": status_counts,
                "duplicate_count": duplicate_count,
                "average_classification_score": float(avg_score) if avg_score else None,
            }
        ),
        200,
    )
