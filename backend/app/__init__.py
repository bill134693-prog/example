from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def create_app(config_name=None):
    """Flask 애플리케이션 팩토리"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    
    from config import config
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
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
