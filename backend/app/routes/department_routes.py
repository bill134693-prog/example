from flask import Blueprint, jsonify, request

from app import db
from app.legal_basis_data import LEGAL_CLASSIFICATION_RULES
from app.models import Department, SubDepartment

bp = Blueprint("departments", __name__, url_prefix="/api/departments")


def _seed_departments() -> list:
    rows = []
    for dept_name, dept_meta in LEGAL_CLASSIFICATION_RULES.items():
        rows.append(
            {
                "name": dept_name,
                "code": dept_meta["code"],
                "description": dept_meta["legal_reference"],
                "sub_departments": [
                    {
                        "name": sub_name,
                        "code": sub_meta["code"],
                        "keywords": ", ".join(sub_meta.get("keywords", [])),
                        "description": sub_meta.get("reason", ""),
                    }
                    for sub_name, sub_meta in dept_meta["sub_departments"].items()
                ],
            }
        )
    return rows


@bp.route("/", methods=["GET"])
def list_departments():
    departments = Department.query.order_by(Department.name.asc()).all()
    result = []
    for dept in departments:
        result.append(
            {
                "id": dept.id,
                "name": dept.name,
                "code": dept.code,
                "description": dept.description,
                "sub_departments": [
                    {
                        "id": sub.id,
                        "name": sub.name,
                        "code": sub.code,
                        "keywords": sub.keywords,
                        "description": sub.description,
                    }
                    for sub in dept.sub_departments
                ],
            }
        )

    return jsonify({"success": True, "total": len(result), "departments": result}), 200


@bp.route("/", methods=["POST"])
def create_department():
    data = request.get_json(silent=True) or {}
    if not data.get("name") or not data.get("code"):
        return jsonify({"error": "name and code are required."}), 400

    try:
        dept = Department(name=data["name"], code=data["code"], description=data.get("description", ""))
        db.session.add(dept)
        db.session.commit()
        return jsonify({"success": True, "department": {"id": dept.id, "name": dept.name, "code": dept.code}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/sub-departments", methods=["GET"])
def list_sub_departments():
    department_id = request.args.get("department_id", type=int)
    query = SubDepartment.query
    if department_id:
        query = query.filter_by(department_id=department_id)

    subs = query.all()
    result = [
        {
            "id": sub.id,
            "department_id": sub.department_id,
            "department_name": sub.department.name,
            "name": sub.name,
            "code": sub.code,
            "keywords": sub.keywords,
            "description": sub.description,
        }
        for sub in subs
    ]
    return jsonify({"success": True, "total": len(result), "sub_departments": result}), 200


@bp.route("/sub-departments", methods=["POST"])
def create_sub_department():
    data = request.get_json(silent=True) or {}
    required = ["department_id", "name", "code"]
    if not all(data.get(f) for f in required):
        return jsonify({"error": "required fields are missing"}), 400

    try:
        sub = SubDepartment(
            department_id=data["department_id"],
            name=data["name"],
            code=data["code"],
            keywords=data.get("keywords", ""),
            description=data.get("description", ""),
        )
        db.session.add(sub)
        db.session.commit()
        return jsonify({"success": True, "sub_department": {"id": sub.id, "name": sub.name, "code": sub.code}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/init-sample-data", methods=["POST"])
def init_sample_data():
    force = request.args.get("force", "false").lower() == "true"

    try:
        rows = _seed_departments()

        if force:
            SubDepartment.query.delete()
            Department.query.delete()
            db.session.flush()

        if Department.query.count() > 0:
            # upsert style: ensure codes from rules exist
            existing_by_code = {d.code: d for d in Department.query.all()}
            for dept_data in rows:
                dept = existing_by_code.get(dept_data["code"])
                if not dept:
                    dept = Department(name=dept_data["name"], code=dept_data["code"], description=dept_data["description"])
                    db.session.add(dept)
                    db.session.flush()
                else:
                    dept.name = dept_data["name"]
                    dept.description = dept_data["description"]

                existing_subs = {s.code: s for s in SubDepartment.query.filter_by(department_id=dept.id).all()}
                for sub_data in dept_data["sub_departments"]:
                    sub = existing_subs.get(sub_data["code"])
                    if not sub:
                        db.session.add(
                            SubDepartment(
                                department_id=dept.id,
                                name=sub_data["name"],
                                code=sub_data["code"],
                                keywords=sub_data.get("keywords", ""),
                                description=sub_data.get("description", ""),
                            )
                        )
                    else:
                        sub.name = sub_data["name"]
                        sub.keywords = sub_data.get("keywords", "")
                        sub.description = sub_data.get("description", "")

            db.session.commit()
            return jsonify({"success": True, "message": "department seed synchronized"}), 200

        for dept_data in rows:
            dept = Department(name=dept_data["name"], code=dept_data["code"], description=dept_data["description"])
            db.session.add(dept)
            db.session.flush()

            for sub_data in dept_data["sub_departments"]:
                db.session.add(
                    SubDepartment(
                        department_id=dept.id,
                        name=sub_data["name"],
                        code=sub_data["code"],
                        keywords=sub_data.get("keywords", ""),
                        description=sub_data.get("description", ""),
                    )
                )

        db.session.commit()
        return jsonify({"success": True, "message": "department seed initialized", "total_departments": len(rows)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
