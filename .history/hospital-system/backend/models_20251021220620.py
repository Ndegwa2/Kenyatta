from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import json

# Models will be defined after app initialization to avoid circular imports
User = None
Department = None
WorkOrder = None
Technician = None
WorkOrderComment = None
WorkOrderAttachment = None
Equipment = None
Ticket = None
TicketComment = None
TicketAttachment = None
Patient = None
Appointment = None
Doctor = None

def init_models(db):
    """Initialize models after app creation"""
    global User, Department, WorkOrder, Technician, WorkOrderComment, WorkOrderAttachment, Equipment, Ticket, TicketComment, TicketAttachment, Patient, Appointment, Doctor

    class User(db.Model, UserMixin):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(150), unique=True, nullable=False)
        password_hash = db.Column(db.String(150), nullable=False)
        role = db.Column(db.String(50), nullable=False)  # e.g., 'manager', 'technician', 'requester'

        def set_password(self, password):
            self.password_hash = generate_password_hash(password)

        def check_password(self, password):
            return check_password_hash(self.password_hash, password)

    class Department(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    class WorkOrder(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=False)
        status = db.Column(db.String(50), default='open')  # open, assigned, in_progress, completed, closed
        priority = db.Column(db.String(20), default='medium')  # low, medium, high, emergency
        category = db.Column(db.String(50), default='facilities')  # plumbing, electrical, machinery, hvac, facilities, emergency
        location = db.Column(db.String(150), nullable=False)  # Room/building where issue is
        equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.id'), nullable=True)  # Specific equipment if applicable
        requester_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Who reported it
        assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Technician assigned
        estimated_hours = db.Column(db.Float, nullable=True)
        actual_hours = db.Column(db.Float, nullable=True)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
        completed_at = db.Column(db.DateTime, nullable=True)

    class Technician(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        skills = db.Column(db.Text, nullable=True)  # JSON array: ["plumbing", "electrical", "machinery"]
        availability = db.Column(db.String(50), default='available')  # available, busy, off_duty
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

        def get_skills_list(self):
            return json.loads(self.skills) if self.skills else []

        def set_skills_list(self, skills_list):
            self.skills = json.dumps(skills_list)

    class WorkOrderComment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        work_order_id = db.Column(db.Integer, db.ForeignKey('work_order.id'), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        comment = db.Column(db.Text, nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    class WorkOrderAttachment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        work_order_id = db.Column(db.Integer, db.ForeignKey('work_order.id'), nullable=False)
        filename = db.Column(db.String(255), nullable=False)
        filepath = db.Column(db.String(500), nullable=False)
        file_type = db.Column(db.String(50), nullable=False)
        file_size = db.Column(db.Integer, nullable=False)  # in bytes
        uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        uploaded_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    class Doctor(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        specialization = db.Column(db.String(100), nullable=True)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    class Appointment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
        doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=True)
        scheduled_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        appointment_date = db.Column(db.Date, nullable=False)
        appointment_time = db.Column(db.Time, nullable=False)
        duration_minutes = db.Column(db.Integer, default=30)
        appointment_type = db.Column(db.String(100), nullable=False)
        reason = db.Column(db.Text, nullable=False)
        notes = db.Column(db.Text, nullable=True)
        status = db.Column(db.String(50), default='scheduled')  # scheduled, confirmed, completed, cancelled
        priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
        confirmed_at = db.Column(db.DateTime, nullable=True)
        completed_at = db.Column(db.DateTime, nullable=True)
        cancelled_at = db.Column(db.DateTime, nullable=True)

        # Relationships
        patient = db.relationship('Patient', backref='appointments')
        department = db.relationship('Department', backref='appointments')
        doctor = db.relationship('Doctor', backref='appointments')
        scheduler = db.relationship('User', foreign_keys=[scheduled_by], backref='scheduled_appointments')

    class Equipment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        location = db.Column(db.String(150), nullable=False)
        category = db.Column(db.String(50), nullable=False)  # machinery, medical_equipment, facilities
        maintenance_schedule = db.Column(db.String(50), nullable=True)  # monthly, quarterly, annual
        last_maintenance = db.Column(db.DateTime, nullable=True)
        next_maintenance = db.Column(db.DateTime, nullable=True)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    class Patient(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        date_of_birth = db.Column(db.Date, nullable=True)
        phone = db.Column(db.String(20), nullable=True)
        address = db.Column(db.Text, nullable=True)
        medical_record_number = db.Column(db.String(50), unique=True, nullable=True)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    class Ticket(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=False)
        status = db.Column(db.String(50), default='open')  # open, in_progress, closed
        priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
        category = db.Column(db.String(50), default='general')  # general, medical, administrative, facilities
        patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
        assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
        resolved_at = db.Column(db.DateTime, nullable=True)

    class TicketComment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        comment = db.Column(db.Text, nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    class TicketAttachment(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=False)
        filename = db.Column(db.String(255), nullable=False)
        filepath = db.Column(db.String(500), nullable=False)
        file_type = db.Column(db.String(50), nullable=False)
        file_size = db.Column(db.Integer, nullable=False)  # in bytes
        uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        uploaded_at = db.Column(db.DateTime, default=db.func.current_timestamp())