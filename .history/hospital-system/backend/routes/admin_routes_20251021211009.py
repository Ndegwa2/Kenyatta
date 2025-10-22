from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import User, WorkOrder, Department, Technician, Equipment, Ticket
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

    # Emergency work orders
    emergency_count = WorkOrder.query.filter_by(priority='emergency').count()

    return jsonify({
        'total_users': total_users,
        'total_work_orders': total_work_orders,
        'open_work_orders': open_work_orders,
        'completed_work_orders': completed_work_orders,
        'total_technicians': total_technicians,
        'total_equipment': total_equipment,
        'emergency_work_orders': emergency_count
    }), 200