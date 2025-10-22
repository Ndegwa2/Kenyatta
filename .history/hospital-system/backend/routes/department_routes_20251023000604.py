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

@department_bp.route('/ticket/<int:ticket_id>/status', methods=['PUT'])
@login_required
def update_ticket_status(ticket_id):
    data = request.get_json()
    ticket = Ticket.query.get(ticket_id)
    if ticket:
        ticket.status = data['status']
        db = get_db()
        db.session.commit()
        return jsonify({'message': 'Ticket status updated'}), 200
    return jsonify({'message': 'Ticket not found'}), 404