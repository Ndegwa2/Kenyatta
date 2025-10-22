from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required
from models import User, Patient, Department, Ticket, CasualWorker

def get_db():
    return current_app.db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@login_required
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'role': u.role
    } for u in users]), 200

@admin_bp.route('/user', methods=['POST'])
@login_required
def create_user():
    data = request.get_json()
    user = User(username=data['username'], role=data['role'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@admin_bp.route('/stats', methods=['GET'])
@login_required
def get_stats():
    patients = Patient.query.count()
    departments = Department.query.count()
    tickets = Ticket.query.count()
    workers = CasualWorker.query.count()
    return jsonify({
        'patients': patients,
        'departments': departments,
        'tickets': tickets,
        'casual_workers': workers
    }), 200