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
Notification = None
Casual = None
TicketTemplate = None
Workflow = None
WorkflowStep = None
WorkflowExecution = None

def init_models(db):
    """Initialize models after app creation"""
    global User, Department, WorkOrder, Technician, WorkOrderComment, WorkOrderAttachment, Equipment, Ticket, TicketComment, TicketAttachment, Patient, Appointment, Doctor, Notification, Casual, MedicalRecord, TicketTemplate, Workflow, WorkflowStep, WorkflowExecution

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
        age = db.Column(db.Integer, nullable=True)
        gender = db.Column(db.String(20), nullable=True)
        phone = db.Column(db.String(20), nullable=True)
        email = db.Column(db.String(150), nullable=True)
        address = db.Column(db.Text, nullable=True)
        city = db.Column(db.String(100), nullable=True)
        state = db.Column(db.String(100), nullable=True)
        zip_code = db.Column(db.String(20), nullable=True)
        medical_record_number = db.Column(db.String(50), unique=True, nullable=True)

        # Emergency contact
        emergency_contact_name = db.Column(db.String(150), nullable=True)
        emergency_contact_phone = db.Column(db.String(20), nullable=True)
        emergency_contact_relationship = db.Column(db.String(50), nullable=True)

        # Medical information
        blood_type = db.Column(db.String(10), nullable=True)
        allergies = db.Column(db.Text, nullable=True)
        chronic_conditions = db.Column(db.Text, nullable=True)
        current_medications = db.Column(db.Text, nullable=True)
        condition = db.Column(db.Text, nullable=True)

        # Insurance information
        insurance_provider = db.Column(db.String(150), nullable=True)
        insurance_policy_number = db.Column(db.String(100), nullable=True)
        insurance_group_number = db.Column(db.String(100), nullable=True)

        # Administrative
        admission_date = db.Column(db.Date, nullable=True)
        discharge_date = db.Column(db.Date, nullable=True)

        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    class Ticket(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=False)
        status = db.Column(db.String(50), default='open')  # open, in_progress, closed
        priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
        category = db.Column(db.String(50), default='general')  # general, medical, administrative, facilities, medical_equipment, hygiene_facilities, patient_room_facilities, emergency_equipment
        patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
        assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
        # Enhanced location tracking for nursing
        location_details = db.Column(db.String(200), nullable=True)  # Room 205, ICU Ward A, etc.
        equipment_id = db.Column(db.String(100), nullable=True)  # Serial number or equipment identifier
        # Impact assessment for health practice
        patient_impact = db.Column(db.String(20), nullable=True)  # none, minor, moderate, severe, critical
        patients_affected = db.Column(db.Integer, default=1)  # Number of patients impacted
        time_sensitivity = db.Column(db.String(20), nullable=True)  # immediate, within_hour, within_shift, within_day
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
    
    class Notification(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        title = db.Column(db.String(200), nullable=False)
        message = db.Column(db.Text, nullable=False)
        type = db.Column(db.String(50), default='info')  # info, success, warning, error
        related_ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=True)
        is_read = db.Column(db.Boolean, default=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

        # Relationships
        user = db.relationship('User', backref='notifications')
        ticket = db.relationship('Ticket', backref='notifications')

    class Casual(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        email = db.Column(db.String(150), unique=True, nullable=False)
        phone = db.Column(db.String(20), nullable=False)
        department = db.Column(db.String(100), nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    class MedicalRecord(db.Model):
        __tablename__ = 'medical_record'
        id = db.Column(db.Integer, primary_key=True)
        patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
        visit_date = db.Column(db.Date, nullable=False)
        doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=True)
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)

        # Visit details
        visit_type = db.Column(db.String(50), nullable=False)  # consultation, emergency, follow-up, procedure
        chief_complaint = db.Column(db.Text, nullable=False)
        diagnosis = db.Column(db.Text, nullable=True)
        treatment = db.Column(db.Text, nullable=True)

        # Vital signs
        blood_pressure_systolic = db.Column(db.Integer, nullable=True)
        blood_pressure_diastolic = db.Column(db.Integer, nullable=True)
        heart_rate = db.Column(db.Integer, nullable=True)
        temperature = db.Column(db.Float, nullable=True)
        weight = db.Column(db.Float, nullable=True)
        height = db.Column(db.Float, nullable=True)
        bmi = db.Column(db.Float, nullable=True)

        # Lab results
        lab_results = db.Column(db.Text, nullable=True)  # JSON string for lab results

        # Prescriptions
        prescriptions = db.Column(db.Text, nullable=True)  # JSON string for medications

        # Notes
        notes = db.Column(db.Text, nullable=True)
        follow_up_instructions = db.Column(db.Text, nullable=True)

        # Administrative
        created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

        # Relationships
        patient = db.relationship('Patient', backref='medical_records')
        doctor = db.relationship('Doctor', backref='medical_records')
        department = db.relationship('Department', backref='medical_records')
        creator = db.relationship('User', foreign_keys=[created_by], backref='created_medical_records')

    class TicketTemplate(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=True)
        category = db.Column(db.String(50), nullable=False)
        priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=True)
        custom_fields = db.Column(db.Text, nullable=True)  # JSON string for custom fields
        workflow_id = db.Column(db.Integer, db.ForeignKey('workflow.id'), nullable=True)
        is_active = db.Column(db.Boolean, default=True)
        created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

        # Relationships
        department = db.relationship('Department', backref='ticket_templates')
        workflow = db.relationship('Workflow', backref='ticket_templates')
        creator = db.relationship('User', foreign_keys=[created_by], backref='created_ticket_templates')

    class Workflow(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=True)
        category = db.Column(db.String(50), nullable=False)  # ticket, work_order, etc.
        is_active = db.Column(db.Boolean, default=True)
        created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

        # Relationships
        creator = db.relationship('User', foreign_keys=[created_by], backref='created_workflows')

    class WorkflowStep(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        workflow_id = db.Column(db.Integer, db.ForeignKey('workflow.id'), nullable=False)
        step_order = db.Column(db.Integer, nullable=False)
        name = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=True)
        step_type = db.Column(db.String(50), nullable=False)  # action, condition, trigger
        config = db.Column(db.Text, nullable=False)  # JSON string for step configuration
        next_step_id = db.Column(db.Integer, db.ForeignKey('workflow_step.id'), nullable=True)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

        # Relationships
        workflow = db.relationship('Workflow', backref='steps')
        next_step = db.relationship('WorkflowStep', remote_side=[id], backref='previous_steps')

    class WorkflowExecution(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        workflow_id = db.Column(db.Integer, db.ForeignKey('workflow.id'), nullable=False)
        ticket_id = db.Column(db.Integer, db.ForeignKey('ticket.id'), nullable=True)
        current_step_id = db.Column(db.Integer, db.ForeignKey('workflow_step.id'), nullable=True)
        status = db.Column(db.String(50), default='running')  # running, completed, failed, paused
        context = db.Column(db.Text, nullable=True)  # JSON string for execution context
        started_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        completed_at = db.Column(db.DateTime, nullable=True)
        error_message = db.Column(db.Text, nullable=True)

        # Relationships
        workflow = db.relationship('Workflow', backref='executions')
        ticket = db.relationship('Ticket', backref='workflow_executions')
        current_step = db.relationship('WorkflowStep', backref='executions')