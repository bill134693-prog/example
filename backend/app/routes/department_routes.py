from flask import Blueprint, jsonify, request

from app import db
from app.models import Department, SubDepartment

bp = Blueprint("departments", __name__, url_prefix="/api/departments")


@bp.route("/", methods=["GET"])
def list_departments():
    departments = Department.query.all()
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
        return jsonify({"error": "name과 code는 필수입니다."}), 400

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
        return jsonify({"error": "필수 필드 누락"}), 400

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
    try:
        if Department.query.count() > 0:
            return jsonify({"success": False, "message": "샘플 데이터가 이미 존재합니다."}), 400

        departments_data = [
            {
                "name": "환경부",
                "code": "MOE",
                "description": "환경 정책 및 오염 관리",
                "sub_departments": [
                    {"name": "대기환경과", "code": "AE", "keywords": "대기, 미세먼지, 악취"},
                    {"name": "수질환경과", "code": "WE", "keywords": "수질, 하천, 폐수"},
                ],
            },
            {
                "name": "국토교통부",
                "code": "MOLIT",
                "description": "국토/교통 인프라 정책",
                "sub_departments": [
                    {"name": "도로과", "code": "RD", "keywords": "도로, 포트홀, 보도"},
                    {"name": "대중교통과", "code": "PT", "keywords": "버스, 지하철, 노선"},
                    {"name": "교통안전과", "code": "TS", "keywords": "교통사고, 신호등, 과속"},
                ],
            },
            {
                "name": "보건복지부",
                "code": "MOHW",
                "description": "의료/복지 정책",
                "sub_departments": [
                    {"name": "의료정책과", "code": "MP", "keywords": "병원, 진료, 약국"},
                    {"name": "질병대응과", "code": "DR", "keywords": "감염, 백신, 방역"},
                    {"name": "노인정책과", "code": "AP", "keywords": "노인, 요양, 돌봄"},
                ],
            },
            {
                "name": "경찰청",
                "code": "NPA",
                "description": "치안 및 수사",
                "sub_departments": [
                    {"name": "교통경찰과", "code": "TP", "keywords": "주정차, 교통법규, 면허"},
                    {"name": "수사과", "code": "INV", "keywords": "사기, 폭행, 고소"},
                ],
            },
            {
                "name": "교육부",
                "code": "MOE_EDU",
                "description": "교육 정책",
                "sub_departments": [
                    {"name": "학교정책과", "code": "SP", "keywords": "학교, 급식, 등록금"},
                    {"name": "특수교육과", "code": "SE", "keywords": "특수교육, 장애학생, 보조기기"},
                ],
            },
        ]

        for dept_data in departments_data:
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
        return jsonify({"success": True, "message": "샘플 데이터 초기화 완료", "total_departments": len(departments_data)}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
