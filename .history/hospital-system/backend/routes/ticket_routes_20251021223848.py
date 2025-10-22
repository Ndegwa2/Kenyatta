from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Ticket, TicketComment, TicketAttachment, User, Department, Patient
from routes.notification_routes import notify_ticket_assignment, notify_ticket_resolved, notify_ticket_comment
from datetime import datetime
import os
from werkzeug.utils import secure_filename

def get_db():
    return current_app.db

ticket_bp = Blueprint('ticket', __name__)

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads/tickets'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Get ticket details with comments and attachments
@ticket_bp.route('/<int:ticket_id>', methods=['GET'])
@login_required
def get_ticket_details(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404
    
    # Get comments
    comments = TicketComment.query.filter_by(ticket_id=ticket_id).order_by(TicketComment.created_at.desc()).all()
    comments_data = [{
        'id': c.id,
        'comment': c.comment,
        'user': User.query.get(c.user_id).username if User.query.get(c.user_id) else 'Unknown',
        'created_at': c.created_at.isoformat() if c.created_at else None
    } for c in comments]
    
    # Get attachments
    attachments = TicketAttachment.query.filter_by(ticket_id=ticket_id).all()
    attachments_data = [{
        'id': a.id,
        'filename': a.filename,
        'file_type': a.file_type,
        'file_size': a.file_size,
        'uploaded_by': User.query.get(a.uploaded_by).username if User.query.get(a.uploaded_by) else 'Unknown',
        'uploaded_at': a.uploaded_at.isoformat() if a.uploaded_at else None
    } for a in attachments]
    
    # Get assigned user
    assigned_user = User.query.get(ticket.assigned_to) if ticket.assigned_to else None
    
    # Get patient and department info
    patient = Patient.query.get(ticket.patient_id)
    department = Department.query.get(ticket.department_id)
    
    return jsonify({
        'id': ticket.id,
        'title': ticket.title,
        'description': ticket.description,
        'status': ticket.status,
        'priority': ticket.priority,
        'category': ticket.category,
        'patient': patient.name if patient else 'Unknown',
        'department': department.name if department else 'Unknown',
        'assigned_to': assigned_user.username if assigned_user else None,
        'created_at': ticket.created_at.isoformat() if ticket.created_at else None,
        'updated_at': ticket.updated_at.isoformat() if ticket.updated_at else None,
        'resolved_at': ticket.resolved_at.isoformat() if ticket.resolved_at else None,
        'comments': comments_data,
        'attachments': attachments_data
    }), 200

# Add comment to ticket
@ticket_bp.route('/<int:ticket_id>/comment', methods=['POST'])
@login_required
def add_comment(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    # Role-based access: allow comments from assigned technician, admin/manager, or ticket creator's department
    if current_user.role == 'technician' and ticket.assigned_to != current_user.id:
        return jsonify({'message': 'Unauthorized: Can only comment on assigned tickets'}), 403
    elif current_user.role == 'patient':
        # Patients can only comment on their own tickets
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient or ticket.patient_id != patient.id:
            return jsonify({'message': 'Unauthorized: Can only comment on own tickets'}), 403

    data = request.get_json()
    comment = TicketComment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        comment=data['comment']
    )

    db = get_db()
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        'message': 'Comment added successfully',
        'comment': {
            'id': comment.id,
            'comment': comment.comment,
            'user': current_user.username,
            'created_at': comment.created_at.isoformat() if comment.created_at else None
        }
    }), 201

# Upload attachment to ticket
@ticket_bp.route('/<int:ticket_id>/attachment', methods=['POST'])
@login_required
def upload_attachment(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    # Role-based access: same as comments
    if current_user.role == 'technician' and ticket.assigned_to != current_user.id:
        return jsonify({'message': 'Unauthorized: Can only upload to assigned tickets'}), 403
    elif current_user.role == 'patient':
        patient = Patient.query.filter_by(user_id=current_user.id).first()
        if not patient or ticket.patient_id != patient.id:
            return jsonify({'message': 'Unauthorized: Can only upload to own tickets'}), 403

    if 'file' not in request.files:
        return jsonify({'message': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'message': 'File type not allowed'}), 400

    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)

    if file_size > MAX_FILE_SIZE:
        return jsonify({'message': 'File size exceeds 10MB limit'}), 400

    # Save file
    filename = secure_filename(file.filename)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    unique_filename = f"{timestamp}_{filename}"

    # Create upload directory if it doesn't exist
    upload_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
    os.makedirs(upload_path, exist_ok=True)

    filepath = os.path.join(upload_path, unique_filename)
    file.save(filepath)

    # Save attachment record
    attachment = TicketAttachment(
        ticket_id=ticket_id,
        filename=filename,
        filepath=filepath,
        file_type=filename.rsplit('.', 1)[1].lower(),
        file_size=file_size,
        uploaded_by=current_user.id
    )

    db = get_db()
    db.session.add(attachment)
    db.session.commit()

    return jsonify({
        'message': 'File uploaded successfully',
        'attachment': {
            'id': attachment.id,
            'filename': attachment.filename,
            'file_type': attachment.file_type,
            'file_size': attachment.file_size,
            'uploaded_at': attachment.uploaded_at.isoformat() if attachment.uploaded_at else None
        }
    }), 201

# Update ticket priority
@ticket_bp.route('/<int:ticket_id>/priority', methods=['PUT'])
@login_required
def update_priority(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    # Role-based access: only admin/manager can change priority
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized: Only managers can change priority'}), 403

    data = request.get_json()
    priority = data.get('priority')

    if priority not in ['low', 'medium', 'high', 'critical']:
        return jsonify({'message': 'Invalid priority level'}), 400

    ticket.priority = priority
    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Priority updated successfully'}), 200

# Assign ticket to user
@ticket_bp.route('/<int:ticket_id>/assign', methods=['PUT'])
@login_required
def assign_ticket(ticket_id):
    # Role-based access: only admin/manager can assign tickets
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized: Only managers can assign tickets'}), 403

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    data = request.get_json()
    user_id = data.get('user_id')

    if user_id:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        # Ensure assigned user is a technician
        if user.role not in ['technician', 'admin', 'manager']:
            return jsonify({'message': 'Can only assign to technicians or managers'}), 400

    ticket.assigned_to = user_id
    # Auto-set status to in_progress when assigned
    if user_id and ticket.status == 'open':
        ticket.status = 'in_progress'

    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Ticket assigned successfully'}), 200

# Update ticket status and set resolved_at if closed
@ticket_bp.route('/<int:ticket_id>/status', methods=['PUT'])
@login_required
def update_ticket_status(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    data = request.get_json()
    status = data.get('status')

    if status not in ['open', 'in_progress', 'closed']:
        return jsonify({'message': 'Invalid status'}), 400

    # Role-based access: technicians can only update their assigned tickets
    if current_user.role == 'technician':
        if ticket.assigned_to != current_user.id:
            return jsonify({'message': 'Unauthorized: Can only update assigned tickets'}), 403
        # Technicians can only set to in_progress or closed
        if status not in ['in_progress', 'closed']:
            return jsonify({'message': 'Technicians can only set status to in_progress or closed'}), 400
    # Admins and managers have full access

    ticket.status = status

    # Set resolved_at when ticket is closed
    if status == 'closed' and not ticket.resolved_at:
        ticket.resolved_at = datetime.utcnow()
    elif status != 'closed':
        ticket.resolved_at = None

    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Status updated successfully'}), 200

# Get tickets with filters
@ticket_bp.route('/list', methods=['GET'])
@login_required
def get_tickets_filtered():
    # Get query parameters
    status = request.args.get('status')
    priority = request.args.get('priority')
    category = request.args.get('category')
    department_id = request.args.get('department_id')
    assigned_to = request.args.get('assigned_to')
    
    # Build query
    query = Ticket.query
    
    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if category:
        query = query.filter_by(category=category)
    if department_id:
        query = query.filter_by(department_id=int(department_id))
    if assigned_to:
        query = query.filter_by(assigned_to=int(assigned_to))
    
    tickets = query.order_by(Ticket.created_at.desc()).all()
    
    tickets_data = []
    for t in tickets:
        patient = Patient.query.get(t.patient_id)
        department = Department.query.get(t.department_id)
        assigned_user = User.query.get(t.assigned_to) if t.assigned_to else None
        
        tickets_data.append({
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'status': t.status,
            'priority': t.priority,
            'category': t.category,
            'patient': patient.name if patient else 'Unknown',
            'department': department.name if department else 'Unknown',
            'assigned_to': assigned_user.username if assigned_user else None,
            'created_at': t.created_at.isoformat() if t.created_at else None,
            'updated_at': t.updated_at.isoformat() if t.updated_at else None
        })
    
    return jsonify(tickets_data), 200