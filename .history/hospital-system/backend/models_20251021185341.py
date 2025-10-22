from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

# Models will be defined after app initialization to avoid circular imports
User = None
Patient = None
Department = None
Ticket = None
CasualWorker = None

def init_models(db):
    """Initialize models after app creation"""
    global User, Patient, Department, Ticket, CasualWorker

    class User(db.Model, UserMixin):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(150), unique=True, nullable=False)
        password_hash = db.Column(db.String(150), nullable=False)
        role = db.Column(db.String(50), nullable=False)  # e.g., 'patient', 'department', 'admin', 'casual'

        def set_password(self, password):
            self.password_hash = generate_password_hash(password)

        def check_password(self, password):
            return check_password_hash(self.password_hash, password)

    class Patient(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        age = db.Column(db.Integer, nullable=False)
        condition = db.Column(db.String(250), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    class Department(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    class Ticket(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=False)
        status = db.Column(db.String(50), default='open')  # open, in_progress, closed
        priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
        category = db.Column(db.String(50), default='general')  # medical, maintenance, administrative, general
        patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
        assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
        resolved_at = db.Column(db.DateTime, nullable=True)

    class CasualWorker(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        task = db.Column(db.String(250), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)