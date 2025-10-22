from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import Department, Ticket

department_bp = Blueprint('department', __name__)

@department_bp.route('/tickets', methods=['GET'])
@login_required
def get_tickets():
    department = Department.query.filter_by(user_id=current_user.id).first()
    tickets = Ticket.query.filter_by(department_id=department.id).all()
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'status': t.status,
        'patient_id': t.patient_id
    } for t in tickets]), 200

@department_bp.route('/ticket/<int:ticket_id>/status', methods=['PUT'])
@login_required
def update_ticket_status(ticket_id):
    data = request.get_json()
    ticket = Ticket.query.get(ticket_id)
    if ticket:
        ticket.status = data['status']
        db.session.commit()
        return jsonify({'message': 'Ticket status updated'}), 200
    return jsonify({'message': 'Ticket not found'}), 404