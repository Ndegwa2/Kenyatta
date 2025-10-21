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
    db = get_db()
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@admin_bp.route('/tickets', methods=['GET'])
@login_required
def get_tickets():
    tickets = Ticket.query.all()
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'status': t.status,
        'department': Department.query.get(t.department_id).name if Department.query.get(t.department_id) else 'Unknown'
    } for t in tickets]), 200

@admin_bp.route('/ticket/<int:ticket_id>/status', methods=['PUT'])
@login_required
def update_ticket_status(ticket_id):
    data = request.get_json()
    ticket = Ticket.query.get(ticket_id)
    if ticket:
        ticket.status = data['status']
        db = get_db()
        db.session.commit()
        return jsonify({'message': 'Ticket status updated'}), 200
    return jsonify({'message': 'Ticket not found'}), 404

@admin_bp.route('/stats', methods=['GET'])
@login_required
def get_stats():
    patients = Patient.query.count()
    departments = Department.query.count()
    tickets = Ticket.query.count()
    workers = CasualWorker.query.count()
    
    # Get ticket status counts
    pending_tickets = Ticket.query.filter_by(status='open').count()
    assigned_tickets = Ticket.query.filter_by(status='in_progress').count()
    resolved_tickets = Ticket.query.filter_by(status='closed').count()
    
    return jsonify({
        'patients': patients,
        'departments': departments,
        'tickets': tickets,
        'casual_workers': workers,
        'pending': pending_tickets,
        'assigned': assigned_tickets,
        'resolved': resolved_tickets
    }), 200