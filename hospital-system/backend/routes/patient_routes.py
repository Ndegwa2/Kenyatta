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
        'age': patient.age,
        'gender': patient.gender,
        'phone': patient.phone,
        'email': patient.email,
        'address': patient.address,
        'city': patient.city,
        'state': patient.state,
        'zip_code': patient.zip_code,
        'medical_record_number': patient.medical_record_number,
        'emergency_contact_name': patient.emergency_contact_name,
        'emergency_contact_phone': patient.emergency_contact_phone,
        'emergency_contact_relationship': patient.emergency_contact_relationship,
        'blood_type': patient.blood_type,
        'allergies': patient.allergies,
        'chronic_conditions': patient.chronic_conditions,
        'current_medications': patient.current_medications,
        'condition': patient.condition,
        'insurance_provider': patient.insurance_provider,
        'insurance_policy_number': patient.insurance_policy_number,
        'insurance_group_number': patient.insurance_group_number,
        'admission_date': patient.admission_date.isoformat() if patient.admission_date else None,
        'discharge_date': patient.discharge_date.isoformat() if patient.discharge_date else None,
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
    if 'age' in data:
        patient.age = data['age']
    if 'gender' in data:
        patient.gender = data['gender']

    # Update contact information
    if 'phone' in data:
        patient.phone = data['phone']
    if 'email' in data:
        patient.email = data['email']
    if 'address' in data:
        patient.address = data['address']
    if 'city' in data:
        patient.city = data['city']
    if 'state' in data:
        patient.state = data['state']
    if 'zip_code' in data:
        patient.zip_code = data['zip_code']
    if 'medical_record_number' in data:
        patient.medical_record_number = data['medical_record_number']

    # Update emergency contact
    if 'emergency_contact_name' in data:
        patient.emergency_contact_name = data['emergency_contact_name']
    if 'emergency_contact_phone' in data:
        patient.emergency_contact_phone = data['emergency_contact_phone']
    if 'emergency_contact_relationship' in data:
        patient.emergency_contact_relationship = data['emergency_contact_relationship']

    # Update medical information
    if 'blood_type' in data:
        patient.blood_type = data['blood_type']
    if 'allergies' in data:
        patient.allergies = data['allergies']
    if 'chronic_conditions' in data:
        patient.chronic_conditions = data['chronic_conditions']
    if 'current_medications' in data:
        patient.current_medications = data['current_medications']
    if 'condition' in data:
        patient.condition = data['condition']

    # Update insurance information
    if 'insurance_provider' in data:
        patient.insurance_provider = data['insurance_provider']
    if 'insurance_policy_number' in data:
        patient.insurance_policy_number = data['insurance_policy_number']
    if 'insurance_group_number' in data:
        patient.insurance_group_number = data['insurance_group_number']

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
        'priority': t.priority,
        'category': t.category,
        'department_id': t.department_id,
        'assigned_to': t.assigned_to,
        'created_at': t.created_at.isoformat() if t.created_at else None,
        'updated_at': t.updated_at.isoformat() if t.updated_at else None
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