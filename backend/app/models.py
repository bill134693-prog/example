from datetime import datetime
from enum import Enum

from app import db


class ComplaintStatus(Enum):
    """민원 상태"""

    RECEIVED = "접수"
    CLASSIFIED = "분류완료"
    PROCESSING = "처리중"
    RESPONSE_COMPLETED = "답변완료"
    CLOSED = "종결"
    WITHDRAWN = "취하"
    TRANSFERRED = "이송"
    DUPLICATE_ALERT = "반복민원알림"


class Department(db.Model):
    __tablename__ = "departments"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    code = db.Column(db.String(20), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sub_departments = db.relationship(
        "SubDepartment", backref="department", lazy=True, cascade="all, delete-orphan"
    )
    complaints = db.relationship("Complaint", backref="department", lazy=True)


class SubDepartment(db.Model):
    __tablename__ = "sub_departments"

    id = db.Column(db.Integer, primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), nullable=False)
    keywords = db.Column(db.Text)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    complaints = db.relationship("Complaint", backref="sub_department", lazy=True)

    __table_args__ = (db.UniqueConstraint("department_id", "code", name="_dept_code_uc"),)


class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.String(50), nullable=False, unique=True)
    citizen_id = db.Column(db.String(64), nullable=False)
    citizen_name = db.Column(db.String(100), nullable=False)
    citizen_phone = db.Column(db.String(20))
    citizen_address = db.Column(db.Text)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    content_summary = db.Column(db.Text)
    status = db.Column(db.String(20), default=ComplaintStatus.RECEIVED.value)
    complaint_type = db.Column(db.String(30), default="기타민원")
    complaint_type_manual = db.Column(db.Boolean, default=False)

    department_id = db.Column(db.Integer, db.ForeignKey("departments.id"))
    sub_department_id = db.Column(db.Integer, db.ForeignKey("sub_departments.id"))

    classification_score = db.Column(db.Float)
    is_duplicate = db.Column(db.Boolean, default=False)
    duplicate_alert_sent = db.Column(db.Boolean, default=False)
    related_complaint_ids = db.Column(db.String(500))
    repeat_count = db.Column(db.Integer, default=0)

    received_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime)
    handler_id = db.Column(db.String(100))
    response_content = db.Column(db.Text)
    response_date = db.Column(db.DateTime)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    classifications = db.relationship(
        "Classification", backref="complaint", lazy=True, cascade="all, delete-orphan"
    )
    duplicates = db.relationship("DuplicateAlert", backref="complaint", lazy=True, cascade="all, delete-orphan")


class Classification(db.Model):
    __tablename__ = "classifications"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=False)
    predicted_department = db.Column(db.String(100), nullable=False)
    predicted_sub_department = db.Column(db.String(100), nullable=False)
    prediction_score = db.Column(db.Float)
    reasoning = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class DuplicateAlert(db.Model):
    __tablename__ = "duplicate_alerts"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=False)
    similar_complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=False)
    similarity_score = db.Column(db.Float, nullable=False)
    alert_message = db.Column(db.String(255), nullable=False)
    is_reviewed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime)

    similar_complaint = db.relationship("Complaint", foreign_keys=[similar_complaint_id])


class TrainingData(db.Model):
    __tablename__ = "training_data"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    department = db.Column(db.String(100), nullable=False)
    sub_department = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ProcessingHistory(db.Model):
    __tablename__ = "processing_history"

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey("complaints.id"), nullable=False)
    action_type = db.Column(db.String(50), nullable=False)
    action_by = db.Column(db.String(100), nullable=False)
    action_description = db.Column(db.Text)
    status_before = db.Column(db.String(50))
    status_after = db.Column(db.String(50))
    department_before = db.Column(db.String(100))
    department_after = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
