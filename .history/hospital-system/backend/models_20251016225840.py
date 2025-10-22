from flask import current_app
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

def get_db():
    return current_app.db

class User(get_db().Model, UserMixin):
    id = get_db().Column(get_db().Integer, primary_key=True)
    username = get_db().Column(get_db().String(150), unique=True, nullable=False)
    password_hash = get_db().Column(get_db().String(150), nullable=False)
    role = get_db().Column(get_db().String(50), nullable=False)  # e.g., 'patient', 'department', 'admin', 'casual'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Patient(get_db().Model):
    id = get_db().Column(get_db().Integer, primary_key=True)
    name = get_db().Column(get_db().String(150), nullable=False)
    age = get_db().Column(get_db().Integer, nullable=False)
    condition = get_db().Column(get_db().String(250), nullable=False)
    user_id = get_db().Column(get_db().Integer, get_db().ForeignKey('user.id'), nullable=False)

class Department(get_db().Model):
    id = get_db().Column(get_db().Integer, primary_key=True)
    name = get_db().Column(get_db().String(150), nullable=False)
    user_id = get_db().Column(get_db().Integer, get_db().ForeignKey('user.id'), nullable=False)

class Ticket(get_db().Model):
    id = get_db().Column(get_db().Integer, primary_key=True)
    title = get_db().Column(get_db().String(150), nullable=False)
    description = get_db().Column(get_db().Text, nullable=False)
    status = get_db().Column(get_db().String(50), default='open')  # open, in_progress, closed
    patient_id = get_db().Column(get_db().Integer, get_db().ForeignKey('patient.id'), nullable=False)
    department_id = get_db().Column(get_db().Integer, get_db().ForeignKey('department.id'), nullable=False)

class CasualWorker(get_db().Model):
    id = get_db().Column(get_db().Integer, primary_key=True)
    name = get_db().Column(get_db().String(150), nullable=False)
    task = get_db().Column(get_db().String(250), nullable=False)
    user_id = get_db().Column(get_db().Integer, get_db().ForeignKey('user.id'), nullable=False)