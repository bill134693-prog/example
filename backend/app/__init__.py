from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()


def _ensure_complaint_columns():
    # Lightweight runtime migration for sqlite deployments.
    try:
        inspector = db.inspect(db.engine)
        columns = {c["name"] for c in inspector.get_columns("complaints")}
        with db.engine.begin() as conn:
            if "complaint_type" not in columns:
                conn.exec_driver_sql("ALTER TABLE complaints ADD COLUMN complaint_type VARCHAR(30)")
                conn.exec_driver_sql("UPDATE complaints SET complaint_type='기타민원' WHERE complaint_type IS NULL")
            if "complaint_type_manual" not in columns:
                conn.exec_driver_sql("ALTER TABLE complaints ADD COLUMN complaint_type_manual BOOLEAN DEFAULT 0")
                conn.exec_driver_sql(
                    "UPDATE complaints SET complaint_type_manual=0 WHERE complaint_type_manual IS NULL"
                )
    except Exception:
        # Non-fatal in environments where migration isn't required.
        pass


def _sync_department_seed():
    """Synchronize department/sub-department seed data without destructive reset."""
    try:
        from app.legal_basis_data import LEGAL_CLASSIFICATION_RULES
        from app.models import Department, SubDepartment

        existing_by_code = {d.code: d for d in Department.query.all()}

        for dept_name, dept_meta in LEGAL_CLASSIFICATION_RULES.items():
            dept = existing_by_code.get(dept_meta["code"])
            if not dept:
                dept = Department(
                    name=dept_name,
                    code=dept_meta["code"],
                    description=dept_meta.get("legal_reference", ""),
                )
                db.session.add(dept)
                db.session.flush()
            else:
                dept.name = dept_name
                dept.description = dept_meta.get("legal_reference", "")

            existing_subs = {s.code: s for s in SubDepartment.query.filter_by(department_id=dept.id).all()}
            for sub_name, sub_meta in dept_meta.get("sub_departments", {}).items():
                sub = existing_subs.get(sub_meta["code"])
                keywords = ", ".join(sub_meta.get("keywords", []))
                if not sub:
                    db.session.add(
                        SubDepartment(
                            department_id=dept.id,
                            name=sub_name,
                            code=sub_meta["code"],
                            keywords=keywords,
                            description=sub_meta.get("reason", ""),
                        )
                    )
                else:
                    sub.name = sub_name
                    sub.keywords = keywords
                    sub.description = sub_meta.get("reason", "")

        db.session.commit()
    except Exception:
        db.session.rollback()


def _cleanup_removed_complaints():
    """Delete explicitly requested test complaints from persisted data."""
    titles_to_delete = {"고용노동부 유희승 퇴직연금", "고용노동부 유희승"}
    try:
        from app.models import Classification, Complaint, DuplicateAlert, ProcessingHistory

        targets = Complaint.query.filter(Complaint.title.in_(titles_to_delete)).all()
        if not targets:
            return

        target_ids = [c.id for c in targets]
        Classification.query.filter(Classification.complaint_id.in_(target_ids)).delete(synchronize_session=False)
        ProcessingHistory.query.filter(ProcessingHistory.complaint_id.in_(target_ids)).delete(synchronize_session=False)
        DuplicateAlert.query.filter(
            (DuplicateAlert.complaint_id.in_(target_ids)) | (DuplicateAlert.similar_complaint_id.in_(target_ids))
        ).delete(synchronize_session=False)
        Complaint.query.filter(Complaint.id.in_(target_ids)).delete(synchronize_session=False)
        db.session.commit()
    except Exception:
        db.session.rollback()


def create_app(config_name=None):
    """Flask ?좏뵆由ъ??댁뀡 ?⑺넗由?""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    
    from config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    
    # Register blueprints
    from app.routes import complaint_routes, classification_routes, duplicate_routes, department_routes
    app.register_blueprint(complaint_routes.bp)
    app.register_blueprint(classification_routes.bp)
    app.register_blueprint(duplicate_routes.bp)
    app.register_blueprint(department_routes.bp)
    
    # Create tables
    with app.app_context():
        db.create_all()
        _ensure_complaint_columns()
        _sync_department_seed()
        _cleanup_removed_complaints()
    
    return app
