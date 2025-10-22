from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime, time, timedelta
from sqlalchemy import and_, or_

def get_db():
    return current_app.db

# Import models after app initialization
Appointment = None
Patient = None
Department = None
User = None

def init_appointment_models(db):
    global Appointment, Patient, Department, User
    from models import Appointment as ApptModel, Patient as PatientModel, Department as DeptModel, User as UserModel
    Appointment = ApptModel
    Patient = PatientModel
    Department = DeptModel
    User = UserModel

appointment_bp = Blueprint('appointment', __name__)

@appointment_bp.route('/appointments', methods=['GET'])
@login_required
def get_appointments():
    """Get appointments based on user role"""
    try:
        # Get query parameters
        status = request.args.get('status')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        department_id = request.args.get('department_id')

        query = Appointment.query

        # Filter based on user role
        if current_user.role == 'patient':
            # Patients can only see their own appointments
            patient = Patient.query.filter_by(user_id=current_user.id).first()
            if not patient:
                return jsonify({'error': 'Patient profile not found'}), 404
            query = query.filter_by(patient_id=patient.id)
        elif current_user.role == 'department':
            # Department users can see appointments for their department
            department = Department.query.filter_by(user_id=current_user.id).first()
            if department:
                query = query.filter_by(department_id=department.id)
        # Admin can see all appointments

        # Apply filters
        if status:
            query = query.filter_by(status=status)
        if department_id:
            query = query.filter_by(department_id=int(department_id))
        if date_from:
            query = query.filter(Appointment.appointment_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        if date_to:
            query = query.filter(Appointment.appointment_date <= datetime.strptime(date_to, '%Y-%m-%d').date())

        # Order by date and time
        appointments = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc()).all()

        result = []
        for appt in appointments:
            result.append({
                'id': appt.id,
                'patient_id': appt.patient_id,
                'patient_name': appt.patient.name if appt.patient else 'Unknown',
                'department_id': appt.department_id,
                'department_name': appt.department.name if appt.department else 'Unknown',
                'doctor_id': appt.doctor_id,
                'doctor_name': appt.doctor.name if appt.doctor else None,
                'appointment_date': appt.appointment_date.isoformat(),
                'appointment_time': appt.appointment_time.isoformat(),
                'duration_minutes': appt.duration_minutes,
                'appointment_type': appt.appointment_type,
                'reason': appt.reason,
                'notes': appt.notes,
                'status': appt.status,
                'priority': appt.priority,
                'created_at': appt.created_at.isoformat() if appt.created_at else None,
                'scheduled_by': appt.scheduled_by,
                'scheduler_name': appt.scheduler.username if appt.scheduler else 'Unknown'
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/appointment', methods=['POST'])
@login_required
def create_appointment():
    """Create a new appointment"""
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['patient_id', 'department_id', 'appointment_date', 'appointment_time', 'appointment_type', 'reason']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check permissions
        if current_user.role == 'patient':
            # Patients can only book appointments for themselves
            patient = Patient.query.filter_by(user_id=current_user.id).first()
            if not patient or patient.id != data['patient_id']:
                return jsonify({'error': 'Unauthorized to create appointment for this patient'}), 403
        elif current_user.role == 'department':
            # Department users can only create appointments for their department
            department = Department.query.filter_by(user_id=current_user.id).first()
            if not department or department.id != data['department_id']:
                return jsonify({'error': 'Unauthorized to create appointment for this department'}), 403

        # Parse date and time
        appointment_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
        appointment_time = datetime.strptime(data['appointment_time'], '%H:%M').time()

        # Check for scheduling conflicts (same doctor, date, and overlapping time)
        if 'doctor_id' in data and data['doctor_id']:
            duration = data.get('duration_minutes', 30)
            end_time = datetime.combine(appointment_date, appointment_time) + timedelta(minutes=duration)

            conflict = Appointment.query.filter(
                and_(
                    Appointment.doctor_id == data['doctor_id'],
                    Appointment.appointment_date == appointment_date,
                    Appointment.status.in_(['scheduled', 'confirmed']),
                    or_(
                        and_(Appointment.appointment_time <= appointment_time,
                             Appointment.appointment_time + timedelta(minutes=Appointment.duration_minutes) > appointment_time),
                        and_(appointment_time <= Appointment.appointment_time,
                             end_time > Appointment.appointment_time)
                    )
                )
            ).first()

            if conflict:
                return jsonify({'error': 'Time slot conflicts with existing appointment'}), 409

        # Create appointment
        appointment = Appointment(
            patient_id=data['patient_id'],
            department_id=data['department_id'],
            doctor_id=data.get('doctor_id'),
            scheduled_by=current_user.id,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            duration_minutes=data.get('duration_minutes', 30),
            appointment_type=data['appointment_type'],
            reason=data['reason'],
            notes=data.get('notes'),
            priority=data.get('priority', 'normal')
        )

        db = get_db()
        db.session.add(appointment)
        db = get_db()
        db.session.commit()

        return jsonify({
            'message': 'Appointment created successfully',
            'appointment_id': appointment.id
        }), 201

    except ValueError as e:
        return jsonify({'error': 'Invalid date/time format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/appointment/<int:appointment_id>', methods=['GET'])
@login_required
def get_appointment(appointment_id):
    """Get a specific appointment"""
    try:
        appointment = Appointment.query.get_or_404(appointment_id)

        # Check permissions
        if current_user.role == 'patient':
            patient = Patient.query.filter_by(user_id=current_user.id).first()
            if not patient or patient.id != appointment.patient_id:
                return jsonify({'error': 'Unauthorized to view this appointment'}), 403
        elif current_user.role == 'department':
            department = Department.query.filter_by(user_id=current_user.id).first()
            if not department or department.id != appointment.department_id:
                return jsonify({'error': 'Unauthorized to view this appointment'}), 403

        return jsonify({
            'id': appointment.id,
            'patient_id': appointment.patient_id,
            'patient_name': appointment.patient.name if appointment.patient else 'Unknown',
            'department_id': appointment.department_id,
            'department_name': appointment.department.name if appointment.department else 'Unknown',
            'doctor_id': appointment.doctor_id,
            'doctor_name': appointment.doctor.name if appointment.doctor else None,
            'appointment_date': appointment.appointment_date.isoformat(),
            'appointment_time': appointment.appointment_time.isoformat(),
            'duration_minutes': appointment.duration_minutes,
            'appointment_type': appointment.appointment_type,
            'reason': appointment.reason,
            'notes': appointment.notes,
            'status': appointment.status,
            'priority': appointment.priority,
            'created_at': appointment.created_at.isoformat() if appointment.created_at else None,
            'scheduled_by': appointment.scheduled_by,
            'scheduler_name': appointment.scheduler.username if appointment.scheduler else 'Unknown'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/appointment/<int:appointment_id>', methods=['PUT'])
@login_required
def update_appointment(appointment_id):
    """Update an appointment"""
    try:
        appointment = Appointment.query.get_or_404(appointment_id)
        data = request.get_json()

        # Check permissions
        if current_user.role == 'patient':
            patient = Patient.query.filter_by(user_id=current_user.id).first()
            if not patient or patient.id != appointment.patient_id:
                return jsonify({'error': 'Unauthorized to update this appointment'}), 403
            # Patients can only update certain fields
            allowed_fields = ['notes']
            for key in data.keys():
                if key not in allowed_fields:
                    return jsonify({'error': f'Patients can only update: {", ".join(allowed_fields)}'}), 403
        elif current_user.role == 'department':
            department = Department.query.filter_by(user_id=current_user.id).first()
            if not department or department.id != appointment.department_id:
                return jsonify({'error': 'Unauthorized to update this appointment'}), 403

        # Update fields
        updatable_fields = ['doctor_id', 'appointment_date', 'appointment_time', 'duration_minutes',
                          'appointment_type', 'reason', 'notes', 'status', 'priority']

        for field in updatable_fields:
            if field in data:
                if field == 'appointment_date':
                    setattr(appointment, field, datetime.strptime(data[field], '%Y-%m-%d').date())
                elif field == 'appointment_time':
                    setattr(appointment, field, datetime.strptime(data[field], '%H:%M').time())
                else:
                    setattr(appointment, field, data[field])

        # Update timestamp
        appointment.updated_at = datetime.utcnow()

        # Set status-specific timestamps
        if 'status' in data:
            if data['status'] == 'confirmed' and not appointment.confirmed_at:
                appointment.confirmed_at = datetime.utcnow()
            elif data['status'] == 'completed' and not appointment.completed_at:
                appointment.completed_at = datetime.utcnow()
            elif data['status'] == 'cancelled' and not appointment.cancelled_at:
                appointment.cancelled_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'message': 'Appointment updated successfully'})

    except ValueError as e:
        return jsonify({'error': 'Invalid date/time format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/appointment/<int:appointment_id>', methods=['DELETE'])
@login_required
def delete_appointment(appointment_id):
    """Delete an appointment"""
    try:
        appointment = Appointment.query.get_or_404(appointment_id)

        # Check permissions - only admin can delete appointments
        if current_user.role != 'admin':
            return jsonify({'error': 'Only administrators can delete appointments'}), 403

        db = get_db()
        db.session.delete(appointment)
        db.session.commit()

        return jsonify({'message': 'Appointment deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@appointment_bp.route('/appointments/availability', methods=['GET'])
@login_required
def get_availability():
    """Get available time slots for scheduling"""
    try:
        doctor_id = request.args.get('doctor_id')
        date = request.args.get('date')
        department_id = request.args.get('department_id')

        if not date:
            return jsonify({'error': 'Date parameter is required'}), 400

        appointment_date = datetime.strptime(date, '%Y-%m-%d').date()

        # Get existing appointments for the date
        query = Appointment.query.filter(
            and_(
                Appointment.appointment_date == appointment_date,
                Appointment.status.in_(['scheduled', 'confirmed'])
            )
        )

        if doctor_id:
            query = query.filter_by(doctor_id=int(doctor_id))
        elif department_id:
            query = query.filter_by(department_id=int(department_id))

        existing_appointments = query.all()

        # Generate available time slots (assuming 9 AM to 5 PM, 30-minute slots)
        available_slots = []
        current_time = time(9, 0)  # 9:00 AM
        end_time = time(17, 0)     # 5:00 PM
        slot_duration = 30  # minutes

        while current_time < end_time:
            slot_end = datetime.combine(appointment_date, current_time) + timedelta(minutes=slot_duration)
            slot_end_time = slot_end.time()

            # Check if this slot conflicts with existing appointments
            conflict = False
            for appt in existing_appointments:
                appt_end = datetime.combine(appointment_date, appt.appointment_time) + timedelta(minutes=appt.duration_minutes)
                appt_end_time = appt_end.time()

                # Check for overlap
                if (current_time < appt_end_time and slot_end_time > appt.appointment_time):
                    conflict = True
                    break

            if not conflict:
                available_slots.append(current_time.isoformat())

            # Move to next slot
            next_slot = datetime.combine(appointment_date, current_time) + timedelta(minutes=slot_duration)
            current_time = next_slot.time()

        return jsonify({
            'date': date,
            'available_slots': available_slots
        })

    except ValueError as e:
        return jsonify({'error': 'Invalid date format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500