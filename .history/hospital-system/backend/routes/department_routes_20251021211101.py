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