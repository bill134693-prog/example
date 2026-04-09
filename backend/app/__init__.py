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
    
    return app
