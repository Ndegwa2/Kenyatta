from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import User, WorkOrder, Department, Technician, Equipment, Ticket, Casual
from werkzeug.security import generate_password_hash

def get_db():
    return current_app.db

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@login_required
def get_users():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'role': u.role
    } for u in users]), 200

@admin_bp.route('/technicians', methods=['GET'])
@login_required
def get_technicians():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    from models import Technician
    technicians = Technician.query.all()
    technicians_data = []
    for tech in technicians:
        user = User.query.get(tech.user_id)
        if user:
            technicians_data.append({
                'id': tech.id,
                'user_id': tech.user_id,
                'name': tech.name,
                'username': user.username,
                'skills': tech.get_skills_list(),
                'availability': tech.availability
            })

    return jsonify(technicians_data), 200

@admin_bp.route('/user', methods=['POST'])
@login_required
def create_user():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    user = User(
        username=data['username'],
        role=data['role']
    )
    user.set_password(data['password'])

    db = get_db()
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User created successfully'}), 201

@admin_bp.route('/work-orders', methods=['GET'])
@login_required
def get_work_orders():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    work_orders = WorkOrder.query.order_by(WorkOrder.created_at.desc()).all()

    work_orders_data = []
    for wo in work_orders:
        requester = User.query.get(wo.requester_id)
        assigned_user = User.query.get(wo.assigned_to) if wo.assigned_to else None

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
            'estimated_hours': wo.estimated_hours,
            'actual_hours': wo.actual_hours,
            'created_at': wo.created_at.isoformat() if wo.created_at else None,
            'updated_at': wo.updated_at.isoformat() if wo.updated_at else None
        })

    return jsonify(work_orders_data), 200

@admin_bp.route('/tickets', methods=['GET'])
@login_required
def get_tickets():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    tickets = Ticket.query.order_by(Ticket.created_at.desc()).all()

    tickets_data = []
    for t in tickets:
        patient = User.query.get(t.patient_id)
        department = Department.query.get(t.department_id)
        assigned_user = User.query.get(t.assigned_to) if t.assigned_to else None

        tickets_data.append({
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'status': t.status,
            'priority': t.priority,
            'category': t.category,
            'patient': patient.username if patient else 'Unknown',
            'department': department.name if department else 'Unknown',
            'assigned_to': assigned_user.username if assigned_user else None,
            'created_at': t.created_at.isoformat() if t.created_at else None,
            'updated_at': t.updated_at.isoformat() if t.updated_at else None
        })

    return jsonify(tickets_data), 200

@admin_bp.route('/auto-assign/<int:ticket_id>', methods=['POST'])
@login_required
def auto_assign_ticket(ticket_id):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    from models import Ticket, Technician, User
    from routes.notification_routes import notify_ticket_assignment

    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'message': 'Ticket not found'}), 404

    if ticket.assigned_to:
        return jsonify({'message': 'Ticket is already assigned'}), 400

    # Find available technicians with matching skills for the ticket category
    technicians = Technician.query.filter_by(availability='available').all()

    best_match = None
    best_score = 0

    for tech in technicians:
        user = User.query.get(tech.user_id)
        if not user:
            continue

        skills = tech.get_skills_list()
        score = 0

        # Score based on skill matching
        if ticket.category in skills:
            score += 3  # Exact category match
        elif any(skill in ticket.category or ticket.category in skill for skill in skills):
            score += 2  # Partial match
        elif 'general' in skills:
            score += 1  # General maintenance skill

        # Prefer technicians with higher scores
        if score > best_score:
            best_score = score
            best_match = tech

    if not best_match:
        return jsonify({'message': 'No suitable technician available'}), 404

    # Assign the ticket
    ticket.assigned_to = best_match.user_id
    ticket.status = 'in_progress'

    db = get_db()
    db.session.commit()

    # Send notification
    assigned_user = User.query.get(best_match.user_id)
    notify_ticket_assignment(ticket, assigned_user)

    return jsonify({
        'message': 'Ticket auto-assigned successfully',
        'assigned_to': assigned_user.username,
        'technician_name': best_match.name
    }), 200

@admin_bp.route('/work-order/<int:work_order_id>/status', methods=['PUT'])
@login_required
def update_work_order_status(work_order_id):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

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

@admin_bp.route('/departments', methods=['GET'])
@login_required
def get_departments():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    departments = Department.query.all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'user_id': d.user_id
    } for d in departments]), 200

@admin_bp.route('/stats', methods=['GET'])
@login_required
def get_stats():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    total_users = User.query.count()
    total_work_orders = WorkOrder.query.count()
    open_work_orders = WorkOrder.query.filter_by(status='open').count()
    completed_work_orders = WorkOrder.query.filter_by(status='completed').count()
    total_technicians = Technician.query.count()
    total_equipment = Equipment.query.count()
    total_tickets = Ticket.query.count()
    open_tickets = Ticket.query.filter_by(status='open').count()
    closed_tickets = Ticket.query.filter_by(status='closed').count()

    # Emergency work orders
    emergency_count = WorkOrder.query.filter_by(priority='emergency').count()

    return jsonify({
        'total_users': total_users,
        'total_work_orders': total_work_orders,
        'open_work_orders': open_work_orders,
        'completed_work_orders': completed_work_orders,
        'total_technicians': total_technicians,
        'total_equipment': total_equipment,
        'total_tickets': total_tickets,
        'open_tickets': open_tickets,
        'closed_tickets': closed_tickets,
        'emergency_work_orders': emergency_count
    }), 200