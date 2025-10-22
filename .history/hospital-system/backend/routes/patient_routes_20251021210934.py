from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Patient, Ticket

def get_db():
    return current_app.db

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404
    
    return jsonify({
        'id': patient.id,
        'name': patient.name,
        'date_of_birth': patient.date_of_birth.isoformat() if patient.date_of_birth else None,
        'phone': patient.phone,
        'address': patient.address,
        'medical_record_number': patient.medical_record_number,
        'created_at': patient.created_at.isoformat() if patient.created_at else None,
        'updated_at': patient.updated_at.isoformat() if patient.updated_at else None
    }), 200

@patient_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404
    
    data = request.get_json()
    
    # Update basic information
    if 'name' in data:
        patient.name = data['name']
    if 'date_of_birth' in data:
        from datetime import datetime
        patient.date_of_birth = datetime.fromisoformat(data['date_of_birth']).date() if data['date_of_birth'] else None

    # Update contact information
    if 'phone' in data:
        patient.phone = data['phone']
    if 'address' in data:
        patient.address = data['address']
    if 'medical_record_number' in data:
        patient.medical_record_number = data['medical_record_number']
    
    db = get_db()
    db.session.commit()
    
    return jsonify({'message': 'Profile updated successfully'}), 200

@patient_bp.route('/tickets', methods=['GET'])
@login_required
def get_tickets():
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    tickets = Ticket.query.filter_by(patient_id=patient.id).all()
    return jsonify([{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'status': t.status,
        'department_id': t.department_id
    } for t in tickets]), 200

@patient_bp.route('/ticket', methods=['POST'])
@login_required
def create_ticket():
    data = request.get_json()
    patient = Patient.query.filter_by(user_id=current_user.id).first()
    
    if not patient:
        return jsonify({'message': 'Patient profile not found'}), 404
    
    ticket = Ticket(
        title=data['title'],
        description=data['description'],
        patient_id=patient.id,
        department_id=data['department_id'],
        priority=data.get('priority', 'medium'),
        category=data.get('category', 'general')
    )
    db = get_db()
    db.session.add(ticket)
    db.session.commit()
    return jsonify({
        'message': 'Ticket created successfully',
        'ticket_id': ticket.id
    }), 201