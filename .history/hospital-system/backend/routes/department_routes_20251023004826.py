from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Department, WorkOrder, User, Ticket

def get_db():
    return current_app.db

department_bp = Blueprint('department', __name__)

@department_bp.route('/work-orders', methods=['GET'])
@login_required
def get_work_orders():
    # For maintenance department, get all work orders
    if current_user.role == 'manager':
        work_orders = WorkOrder.query.order_by(WorkOrder.created_at.desc()).all()
    else:
        # For requesters, get work orders they submitted
        work_orders = WorkOrder.query.filter_by(requester_id=current_user.id).order_by(WorkOrder.created_at.desc()).all()

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
            'requester': requester.username if requester else 'Unknown',
            'assigned_to': assigned_user.username if assigned_user else None,
            'created_at': wo.created_at.isoformat() if wo.created_at else None
        })

    return jsonify(work_orders_data), 200

@department_bp.route('/work-order/<int:work_order_id>/status', methods=['PUT'])
@login_required
def update_work_order_status(work_order_id):
    data = request.get_json()
    work_order = WorkOrder.query.get(work_order_id)
    if work_order:
        work_order.status = data['status']
        if 'actual_hours' in data:
            work_order.actual_hours = data['actual_hours']
        db = get_db()
        db.session.commit()
        return jsonify({'message': 'Work order status updated'}), 200
    return jsonify({'message': 'Work order not found'}), 404

@department_bp.route('/tickets', methods=['GET'])
@login_required
def get_tickets():
    # Get department for current user
    department = Department.query.filter_by(user_id=current_user.id).first()
    if not department:
        return jsonify({'message': 'Department not found'}), 404

    # Get query parameters for filtering
    status = request.args.get('status')
    priority = request.args.get('priority')
    category = request.args.get('category')
    patient_impact = request.args.get('patient_impact')

    # Build query
    query = Ticket.query.filter_by(department_id=department.id)

    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if category:
        query = query.filter_by(category=category)
    if patient_impact:
        query = query.filter_by(patient_impact=patient_impact)

    tickets = query.order_by(Ticket.created_at.desc()).all()

    tickets_data = []
    for t in tickets:
        patient = User.query.get(t.patient_id)
        assigned_user = User.query.get(t.assigned_to) if t.assigned_to else None

        tickets_data.append({
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'status': t.status,
            'priority': t.priority,
            'category': t.category,
            'patient': patient.username if patient else 'Unknown',
            'patient_id': t.patient_id,
            'assigned_to': assigned_user.username if assigned_user else None,
            'location_details': t.location_details,
            'equipment_id': t.equipment_id,
            'patient_impact': t.patient_impact,
            'patients_affected': t.patients_affected,
            'time_sensitivity': t.time_sensitivity,
            'created_at': t.created_at.isoformat() if t.created_at else None,
            'updated_at': t.updated_at.isoformat() if t.updated_at else None
        })

    return jsonify(tickets_data), 200

@department_bp.route('/ticket/create', methods=['POST'])
@login_required
def create_ticket():
    # Get department for current user
    department = Department.query.filter_by(user_id=current_user.id).first()
    if not department:
        return jsonify({'message': 'Department not found'}), 404

    data = request.get_json()

    # Auto-assign priority based on category for nursing health practice
    category = data.get('category', 'general')
    priority = data.get('priority', 'medium')

    # Priority escalation for critical health equipment
    if category == 'emergency_equipment':
        priority = 'critical'
    elif category == 'medical_equipment' and priority == 'medium':
        priority = 'high'

    # Create ticket
    ticket = Ticket(
        title=data['title'],
        description=data['description'],
        category=category,
        priority=priority,
        patient_id=data.get('patient_id', 1),  # Default patient or get from context
        department_id=department.id,
        location_details=data.get('location_details'),
        equipment_id=data.get('equipment_id'),
        patient_impact=data.get('patient_impact'),
        patients_affected=data.get('patients_affected', 1),
        time_sensitivity=data.get('time_sensitivity')
    )

    db = get_db()
    db.session.add(ticket)
    db.session.commit()

    # TODO: Add emergency notification logic for critical tickets

    return jsonify({
        'message': 'Ticket created successfully',
        'ticket': {
            'id': ticket.id,
            'title': ticket.title,
            'priority': ticket.priority,
            'category': ticket.category
        }
    }), 201

@department_bp.route('/ticket-templates', methods=['GET'])
@login_required
def get_ticket_templates():
    """Get predefined templates for common nursing maintenance requests"""
    templates = [
        {
            'id': 'infusion_pump',
            'title': 'Infusion Pump Malfunction',
            'description': 'Infusion pump is not functioning properly. Patient medication delivery may be affected.',
            'category': 'medical_equipment',
            'priority': 'high',
            'patient_impact': 'severe',
            'time_sensitivity': 'immediate'
        },
        {
            'id': 'patient_toilet',
            'title': 'Patient Room Toilet Issue',
            'description': 'Patient toilet requires immediate cleaning/maintenance. Hygiene standards compromised.',
            'category': 'hygiene_facilities',
            'priority': 'high',
            'patient_impact': 'moderate',
            'time_sensitivity': 'within_hour'
        },
        {
            'id': 'ventilation_noise',
            'title': 'Ventilation System Noise',
            'description': 'Ventilation system making excessive noise, disturbing patient rest.',
            'category': 'patient_room_facilities',
            'priority': 'medium',
            'patient_impact': 'minor',
            'time_sensitivity': 'within_shift'
        },
        {
            'id': 'defibrillator_battery',
            'title': 'Defibrillator Battery Low',
            'description': 'Emergency defibrillator battery is low and needs immediate replacement.',
            'category': 'emergency_equipment',
            'priority': 'critical',
            'patient_impact': 'critical',
            'time_sensitivity': 'immediate'
        },
        {
            'id': 'bed_electric',
            'title': 'Electric Bed Malfunction',
            'description': 'Patient bed electrical system not working. Unable to adjust bed position.',
            'category': 'medical_equipment',
            'priority': 'high',
            'patient_impact': 'moderate',
            'time_sensitivity': 'within_hour'
        },
        {
            'id': 'room_cleaning',
            'title': 'Patient Room Deep Cleaning Required',
            'description': 'Patient room requires thorough cleaning and disinfection.',
            'category': 'hygiene_facilities',
            'priority': 'medium',
            'patient_impact': 'minor',
            'time_sensitivity': 'within_shift'
        }
    ]

    return jsonify(templates), 200

@department_bp.route('/ticket/<int:ticket_id>/comment', methods=['POST'])
@login_required
def add_ticket_comment(ticket_id):
    """Allow nurses to add follow-up comments to their tickets"""
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    # Get department for current user
    department = Department.query.filter_by(user_id=current_user.id).first()
    if not department or ticket.department_id != department.id:
        return jsonify({'message': 'Unauthorized: Can only comment on own department tickets'}), 403

    data = request.get_json()
    comment = data.get('comment', '').strip()
    if not comment:
        return jsonify({'message': 'Comment cannot be empty'}), 400

    # Create comment (using existing TicketComment model)
    from models import TicketComment
    ticket_comment = TicketComment(
        ticket_id=ticket_id,
        user_id=current_user.id,
        comment=comment
    )

    db = get_db()
    db.session.add(ticket_comment)
    db.session.commit()

    return jsonify({
        'message': 'Comment added successfully',
        'comment': {
            'id': ticket_comment.id,
            'comment': ticket_comment.comment,
            'user': current_user.username,
            'created_at': ticket_comment.created_at.isoformat() if ticket_comment.created_at else None
        }
    }), 201

@department_bp.route('/ticket/<int:ticket_id>/comments', methods=['GET'])
@login_required
def get_ticket_comments(ticket_id):
    """Get comments for a specific ticket"""
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    # Get department for current user
    department = Department.query.filter_by(user_id=current_user.id).first()
    if not department or ticket.department_id != department.id:
        return jsonify({'message': 'Unauthorized'}), 403

    from models import TicketComment
    comments = TicketComment.query.filter_by(ticket_id=ticket_id).order_by(TicketComment.created_at.desc()).all()

    comments_data = [{
        'id': c.id,
        'comment': c.comment,
        'user': User.query.get(c.user_id).username if User.query.get(c.user_id) else 'Unknown',
        'created_at': c.created_at.isoformat() if c.created_at else None
    } for c in comments]

    return jsonify(comments_data), 200

# Keep the status update route for maintenance staff (technicians)
@department_bp.route('/ticket/<int:ticket_id>/status', methods=['PUT'])
@login_required
def update_ticket_status(ticket_id):
    # Only allow technicians and admins to update status
    if current_user.role not in ['technician', 'admin', 'manager']:
        return jsonify({'message': 'Unauthorized: Only maintenance staff can update ticket status'}), 403

    data = request.get_json()
    ticket = Ticket.query.get(ticket_id)
    if ticket:
        ticket.status = data['status']
        if data['status'] == 'closed':
            from datetime import datetime
            ticket.resolved_at = datetime.utcnow()
        db = get_db()
        db.session.commit()
        return jsonify({'message': 'Ticket status updated'}), 200
    return jsonify({'message': 'Ticket not found'}), 404