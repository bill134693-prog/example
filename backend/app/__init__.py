from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

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
    
    return app
