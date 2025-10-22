from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import WorkOrder, WorkOrderComment, WorkOrderAttachment, User, Technician
from datetime import datetime
import os
from werkzeug.utils import secure_filename

def get_db():
    return current_app.db

work_order_bp = Blueprint('work_order', __name__)

# Configuration for file uploads
UPLOAD_FOLDER = 'uploads/work_orders'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Get work order details with comments and attachments
@work_order_bp.route('/<int:work_order_id>', methods=['GET'])
@login_required
def get_work_order_details(work_order_id):
    work_order = WorkOrder.query.get(work_order_id)
    if not work_order:
        return jsonify({'message': 'Work order not found'}), 404

    # Get comments
    comments = WorkOrderComment.query.filter_by(work_order_id=work_order_id).order_by(WorkOrderComment.created_at.desc()).all()
    comments_data = [{
        'id': c.id,
        'comment': c.comment,
        'user': User.query.get(c.user_id).username if User.query.get(c.user_id) else 'Unknown',
        'created_at': c.created_at.isoformat() if c.created_at else None
    } for c in comments]

    # Get attachments
    attachments = WorkOrderAttachment.query.filter_by(work_order_id=work_order_id).all()
    attachments_data = [{
        'id': a.id,
        'filename': a.filename,
        'file_type': a.file_type,
        'file_size': a.file_size,
        'uploaded_by': User.query.get(a.uploaded_by).username if User.query.get(a.uploaded_by) else 'Unknown',
        'uploaded_at': a.uploaded_at.isoformat() if a.uploaded_at else None
    } for a in attachments]

    # Get assigned user and requester
    assigned_user = User.query.get(work_order.assigned_to) if work_order.assigned_to else None
    requester = User.query.get(work_order.requester_id)

    return jsonify({
        'id': work_order.id,
        'title': work_order.title,
        'description': work_order.description,
        'status': work_order.status,
        'priority': work_order.priority,
        'category': work_order.category,
        'location': work_order.location,
        'equipment_id': work_order.equipment_id,
        'requester': requester.username if requester else 'Unknown',
        'assigned_to': assigned_user.username if assigned_user else None,
        'estimated_hours': work_order.estimated_hours,
        'actual_hours': work_order.actual_hours,
        'created_at': work_order.created_at.isoformat() if work_order.created_at else None,
        'updated_at': work_order.updated_at.isoformat() if work_order.updated_at else None,
        'completed_at': work_order.completed_at.isoformat() if work_order.completed_at else None,
        'comments': comments_data,
        'attachments': attachments_data
    }), 200

# Create new work order
@work_order_bp.route('/', methods=['POST'])
@login_required
def create_work_order():
    data = request.get_json()

    work_order = WorkOrder(
        title=data['title'],
        description=data['description'],
        priority=data.get('priority', 'medium'),
        category=data.get('category', 'facilities'),
        location=data['location'],
        equipment_id=data.get('equipment_id'),
        requester_id=current_user.id
    )

    db = get_db()
    db.session.add(work_order)
    db.session.commit()

    return jsonify({
        'message': 'Work order created successfully',
        'work_order_id': work_order.id
    }), 201

# Add comment to work order
@work_order_bp.route('/<int:work_order_id>/comment', methods=['POST'])
@login_required
def add_comment(work_order_id):
    work_order = WorkOrder.query.get(work_order_id)
    if not work_order:
        return jsonify({'message': 'Work order not found'}), 404

    data = request.get_json()
    comment = WorkOrderComment(
        work_order_id=work_order_id,
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

# Upload attachment to work order
@work_order_bp.route('/<int:work_order_id>/attachment', methods=['POST'])
@login_required
def upload_attachment(work_order_id):
    work_order = WorkOrder.query.get(work_order_id)
    if not work_order:
        return jsonify({'message': 'Work order not found'}), 404

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
    attachment = WorkOrderAttachment(
        work_order_id=work_order_id,
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

# Update work order priority
@work_order_bp.route('/<int:work_order_id>/priority', methods=['PUT'])
@login_required
def update_priority(work_order_id):
    work_order = WorkOrder.query.get(work_order_id)
    if not work_order:
        return jsonify({'message': 'Work order not found'}), 404

    data = request.get_json()
    priority = data.get('priority')

    if priority not in ['low', 'medium', 'high', 'emergency']:
        return jsonify({'message': 'Invalid priority level'}), 400

    work_order.priority = priority
    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Priority updated successfully'}), 200

# Assign work order to technician
@work_order_bp.route('/<int:work_order_id>/assign', methods=['PUT'])
@login_required
def assign_work_order(work_order_id):
    work_order = WorkOrder.query.get(work_order_id)
    if not work_order:
        return jsonify({'message': 'Work order not found'}), 404

    data = request.get_json()
    user_id = data.get('user_id')

    if user_id:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404

    work_order.assigned_to = user_id
    work_order.status = 'assigned' if user_id else 'open'
    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Work order assigned successfully'}), 200

# Update work order status
@work_order_bp.route('/<int:work_order_id>/status', methods=['PUT'])
@login_required
def update_work_order_status(work_order_id):
    work_order = WorkOrder.query.get(work_order_id)
    if not work_order:
        return jsonify({'message': 'Work order not found'}), 404

    data = request.get_json()
    status = data.get('status')
    actual_hours = data.get('actual_hours')

    if status not in ['open', 'assigned', 'in_progress', 'completed', 'closed']:
        return jsonify({'message': 'Invalid status'}), 400

    work_order.status = status

    if actual_hours is not None:
        work_order.actual_hours = actual_hours

    # Set completed_at when work order is completed
    if status == 'completed' and not work_order.completed_at:
        work_order.completed_at = datetime.utcnow()
    elif status != 'completed':
        work_order.completed_at = None

    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Status updated successfully'}), 200

# Get work orders with filters
@work_order_bp.route('/list', methods=['GET'])
@login_required
def get_work_orders_filtered():
    # Get query parameters
    status = request.args.get('status')
    priority = request.args.get('priority')
    category = request.args.get('category')
    assigned_to = request.args.get('assigned_to')
    requester_id = request.args.get('requester_id')

    # Build query
    query = WorkOrder.query

    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if category:
        query = query.filter_by(category=category)
    if assigned_to:
        query = query.filter_by(assigned_to=int(assigned_to))
    if requester_id:
        query = query.filter_by(requester_id=int(requester_id))

    work_orders = query.order_by(WorkOrder.created_at.desc()).all()

    work_orders_data = []
    for wo in work_orders:
        assigned_user = User.query.get(wo.assigned_to) if wo.assigned_to else None
        requester = User.query.get(wo.requester_id)

        work_orders_data.append({
            'id': wo.id,
            'title': wo.title,
            'description': wo.description,
            'status': wo.status,
            'priority': wo.priority,
            'category': wo.category,
            'location': wo.location,
            'equipment_id': wo.equipment_id,
            'requester': requester.username if requester else 'Unknown',
            'assigned_to': assigned_user.username if assigned_user else None,
            'estimated_hours': wo.estimated_hours,
            'actual_hours': wo.actual_hours,
            'created_at': wo.created_at.isoformat() if wo.created_at else None,
            'updated_at': wo.updated_at.isoformat() if wo.updated_at else None
        })

    return jsonify(work_orders_data), 200