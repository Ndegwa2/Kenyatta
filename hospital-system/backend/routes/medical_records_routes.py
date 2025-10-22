from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime
import json

def get_db():
    return current_app.db

# Import models after app initialization
MedicalRecord = None
Patient = None
Doctor = None
Department = None
User = None

def init_medical_records_models(db):
    global MedicalRecord, Patient, Doctor, Department, User
    from models import MedicalRecord as MRModel, Patient as PatientModel, Doctor as DoctorModel, Department as DeptModel, User as UserModel
    MedicalRecord = MRModel
    Patient = PatientModel
    Doctor = DoctorModel
    Department = DeptModel
    User = UserModel

medical_records_bp = Blueprint('medical_records', __name__)

@medical_records_bp.route('/patient/<int:patient_id>/records', methods=['GET'])
@login_required
def get_patient_records(patient_id):
    """Get medical records for a specific patient"""
    try:
        # Check permissions
        if current_user.role == 'patient':
            patient = Patient.query.filter_by(user_id=current_user.id).first()
            if not patient or patient.id != patient_id:
                return jsonify({'error': 'Unauthorized to view these records'}), 403
        elif current_user.role == 'department':
            # Department users can view records for patients in their department
            department = Department.query.filter_by(user_id=current_user.id).first()
            if not department:
                return jsonify({'error': 'Department not found'}), 404
            # Check if patient has records in this department
            has_records = MedicalRecord.query.filter_by(patient_id=patient_id, department_id=department.id).first()
            if not has_records:
                return jsonify({'error': 'No records found for this patient in your department'}), 404

        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        visit_type = request.args.get('visit_type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')

        query = MedicalRecord.query.filter_by(patient_id=patient_id)

        if visit_type:
            query = query.filter_by(visit_type=visit_type)
        if date_from:
            query = query.filter(MedicalRecord.visit_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        if date_to:
            query = query.filter(MedicalRecord.visit_date <= datetime.strptime(date_to, '%Y-%m-%d').date())

        records = query.order_by(MedicalRecord.visit_date.desc()).limit(limit).offset(offset).all()

        result = []
        for record in records:
            result.append({
                'id': record.id,
                'visit_date': record.visit_date.isoformat(),
                'doctor_name': record.doctor.name if record.doctor else None,
                'department_name': record.department.name if record.department else None,
                'visit_type': record.visit_type,
                'chief_complaint': record.chief_complaint,
                'diagnosis': record.diagnosis,
                'treatment': record.treatment,
                'vital_signs': {
                    'blood_pressure': f"{record.blood_pressure_systolic}/{record.blood_pressure_diastolic}" if record.blood_pressure_systolic and record.blood_pressure_diastolic else None,
                    'heart_rate': record.heart_rate,
                    'temperature': record.temperature,
                    'weight': record.weight,
                    'height': record.height,
                    'bmi': record.bmi
                },
                'lab_results': json.loads(record.lab_results) if record.lab_results else None,
                'prescriptions': json.loads(record.prescriptions) if record.prescriptions else None,
                'notes': record.notes,
                'follow_up_instructions': record.follow_up_instructions,
                'created_by': record.creator.username if record.creator else None,
                'created_at': record.created_at.isoformat() if record.created_at else None
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@medical_records_bp.route('/record', methods=['POST'])
@login_required
def create_medical_record():
    """Create a new medical record"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['patient_id', 'visit_date', 'department_id', 'visit_type', 'chief_complaint']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check permissions - only doctors and department staff can create records
        if current_user.role not in ['admin', 'department']:
            return jsonify({'error': 'Unauthorized to create medical records'}), 403

        # If department user, check if they belong to the specified department
        if current_user.role == 'department':
            department = Department.query.filter_by(user_id=current_user.id).first()
            if not department or department.id != data['department_id']:
                return jsonify({'error': 'Unauthorized to create records for this department'}), 403

        # Parse visit date
        visit_date = datetime.strptime(data['visit_date'], '%Y-%m-%d').date()

        # Create medical record
        record = MedicalRecord(
            patient_id=data['patient_id'],
            visit_date=visit_date,
            doctor_id=data.get('doctor_id'),
            department_id=data['department_id'],
            visit_type=data['visit_type'],
            chief_complaint=data['chief_complaint'],
            diagnosis=data.get('diagnosis'),
            treatment=data.get('treatment'),
            blood_pressure_systolic=data.get('blood_pressure_systolic'),
            blood_pressure_diastolic=data.get('blood_pressure_diastolic'),
            heart_rate=data.get('heart_rate'),
            temperature=data.get('temperature'),
            weight=data.get('weight'),
            height=data.get('height'),
            bmi=data.get('bmi'),
            lab_results=json.dumps(data.get('lab_results')) if data.get('lab_results') else None,
            prescriptions=json.dumps(data.get('prescriptions')) if data.get('prescriptions') else None,
            notes=data.get('notes'),
            follow_up_instructions=data.get('follow_up_instructions'),
            created_by=current_user.id
        )

        db = get_db()
        db.session.add(record)
        db.session.commit()

        return jsonify({
            'message': 'Medical record created successfully',
            'record_id': record.id
        }), 201

    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@medical_records_bp.route('/record/<int:record_id>', methods=['GET'])
@login_required
def get_medical_record(record_id):
    """Get a specific medical record"""
    try:
        record = MedicalRecord.query.get_or_404(record_id)

        # Check permissions
        if current_user.role == 'patient':
            patient = Patient.query.filter_by(user_id=current_user.id).first()
            if not patient or patient.id != record.patient_id:
                return jsonify({'error': 'Unauthorized to view this record'}), 403
        elif current_user.role == 'department':
            department = Department.query.filter_by(user_id=current_user.id).first()
            if not department or department.id != record.department_id:
                return jsonify({'error': 'Unauthorized to view this record'}), 403

        return jsonify({
            'id': record.id,
            'patient_id': record.patient_id,
            'visit_date': record.visit_date.isoformat(),
            'doctor_name': record.doctor.name if record.doctor else None,
            'department_name': record.department.name if record.department else None,
            'visit_type': record.visit_type,
            'chief_complaint': record.chief_complaint,
            'diagnosis': record.diagnosis,
            'treatment': record.treatment,
            'vital_signs': {
                'blood_pressure': f"{record.blood_pressure_systolic}/{record.blood_pressure_diastolic}" if record.blood_pressure_systolic and record.blood_pressure_diastolic else None,
                'heart_rate': record.heart_rate,
                'temperature': record.temperature,
                'weight': record.weight,
                'height': record.height,
                'bmi': record.bmi
            },
            'lab_results': json.loads(record.lab_results) if record.lab_results else None,
            'prescriptions': json.loads(record.prescriptions) if record.prescriptions else None,
            'notes': record.notes,
            'follow_up_instructions': record.follow_up_instructions,
            'created_by': record.creator.username if record.creator else None,
            'created_at': record.created_at.isoformat() if record.created_at else None,
            'updated_at': record.updated_at.isoformat() if record.updated_at else None
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@medical_records_bp.route('/record/<int:record_id>', methods=['PUT'])
@login_required
def update_medical_record(record_id):
    """Update a medical record"""
    try:
        record = MedicalRecord.query.get_or_404(record_id)
        data = request.get_json()

        # Check permissions - only the creator or admin can update
        if current_user.role not in ['admin'] and record.created_by != current_user.id:
            return jsonify({'error': 'Unauthorized to update this record'}), 403

        # Update fields
        updatable_fields = [
            'visit_date', 'doctor_id', 'visit_type', 'chief_complaint', 'diagnosis', 'treatment',
            'blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 'temperature',
            'weight', 'height', 'bmi', 'lab_results', 'prescriptions', 'notes', 'follow_up_instructions'
        ]

        for field in updatable_fields:
            if field in data:
                if field == 'visit_date':
                    setattr(record, field, datetime.strptime(data[field], '%Y-%m-%d').date())
                elif field in ['lab_results', 'prescriptions']:
                    setattr(record, field, json.dumps(data[field]) if data[field] else None)
                else:
                    setattr(record, field, data[field])

        record.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'message': 'Medical record updated successfully'})

    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@medical_records_bp.route('/record/<int:record_id>', methods=['DELETE'])
@login_required
def delete_medical_record(record_id):
    """Delete a medical record"""
    try:
        record = MedicalRecord.query.get_or_404(record_id)

        # Check permissions - only admin can delete records
        if current_user.role != 'admin':
            return jsonify({'error': 'Only administrators can delete medical records'}), 403

        db = get_db()
        db.session.delete(record)
        db.session.commit()

        return jsonify({'message': 'Medical record deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500