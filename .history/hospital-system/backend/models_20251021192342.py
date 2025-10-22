from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

# Models will be defined after app initialization to avoid circular imports
User = None
Patient = None
Department = None
Ticket = None
CasualWorker = None
TicketComment = None
TicketAttachment = None
Appointment = None

def init_models(db):
    """Initialize models after app creation"""
    global User, Patient, Department, Ticket, CasualWorker, TicketComment, TicketAttachment, Appointment

    class User(db.Model, UserMixin):
        id = db.Column(db.Integer, primary_key=True)
        username = db.Column(db.String(150), unique=True, nullable=False)
        password_hash = db.Column(db.String(150), nullable=False)
        role = db.Column(db.String(50), nullable=False)  # e.g., 'patient', 'department', 'admin', 'casual'

        def set_password(self, password):
            self.password_hash = generate_password_hash(password)

        def check_password(self, password):
            return check_password_hash(self.password_hash, password)

    class Patient(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        age = db.Column(db.Integer, nullable=False)
        gender = db.Column(db.String(20), nullable=True)
        date_of_birth = db.Column(db.Date, nullable=True)
        
        # Contact Information
        phone = db.Column(db.String(20), nullable=True)
        email = db.Column(db.String(150), nullable=True)
        address = db.Column(db.Text, nullable=True)
        city = db.Column(db.String(100), nullable=True)
        state = db.Column(db.String(100), nullable=True)
        zip_code = db.Column(db.String(20), nullable=True)
        
        # Emergency Contact
        emergency_contact_name = db.Column(db.String(150), nullable=True)
        emergency_contact_phone = db.Column(db.String(20), nullable=True)
        emergency_contact_relationship = db.Column(db.String(50), nullable=True)
        
        # Medical Information
        blood_type = db.Column(db.String(5), nullable=True)  # A+, A-, B+, B-, AB+, AB-, O+, O-
        allergies = db.Column(db.Text, nullable=True)  # JSON string or comma-separated
        chronic_conditions = db.Column(db.Text, nullable=True)
        current_medications = db.Column(db.Text, nullable=True)
        
        # Insurance Information
        insurance_provider = db.Column(db.String(150), nullable=True)
        insurance_policy_number = db.Column(db.String(100), nullable=True)
        insurance_group_number = db.Column(db.String(100), nullable=True)
        
        # Administrative
        condition = db.Column(db.String(250), nullable=True)  # Current condition/reason for visit
        admission_date = db.Column(db.DateTime, nullable=True)
        discharge_date = db.Column(db.DateTime, nullable=True)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    class Department(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    class Ticket(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(150), nullable=False)
        description = db.Column(db.Text, nullable=False)
        status = db.Column(db.String(50), default='open')  # open, in_progress, closed
        priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
        category = db.Column(db.String(50), default='general')  # medical, maintenance, administrative, general
        patient_id = db.Column(db.Integer, db.ForeignKey('patient.id'), nullable=False)
        department_id = db.Column(db.Integer, db.ForeignKey('department.id'), nullable=False)
        assigned_to = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
        created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
        updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
        resolved_at = db.Column(db.DateTime, nullable=True)

    class CasualWorker(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(150), nullable=False)
        task = db.Column(db.String(250), nullable=False)
        user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

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