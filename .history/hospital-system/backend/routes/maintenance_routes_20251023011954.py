from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Technician, WorkOrder, User

def get_db():
    return current_app.db

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/technicians', methods=['GET'])
@login_required
def get_technicians():
    technicians = Technician.query.all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'skills': t.get_skills_list(),
        'availability': t.availability,
        'user_id': t.user_id
    } for t in technicians]), 200

@maintenance_bp.route('/workers', methods=['GET'])
@login_required
def get_workers():
    # For casual workers, return technicians as workers
    technicians = Technician.query.all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'task': ', '.join(t.get_skills_list()) if t.get_skills_list() else 'General Maintenance'
    } for t in technicians]), 200

@maintenance_bp.route('/technician', methods=['POST'])
@login_required
def add_technician():
    data = request.get_json()
    technician = Technician(
        name=data['name'],
        user_id=data.get('user_id', current_user.id)
    )

    # Set skills if provided
    if 'skills' in data:
        technician.set_skills_list(data['skills'])

    db = get_db()
    db.session.add(technician)
    db.session.commit()
    return jsonify({'message': 'Technician added successfully'}), 201

@maintenance_bp.route('/worker', methods=['POST'])
@login_required
def add_worker():
    data = request.get_json()
    # For casual workers, create a technician with the task as skills
    technician = Technician(
        name=data['name'],
        user_id=current_user.id
    )

    # Set task as skills
    if 'task' in data:
        technician.set_skills_list([data['task']])

    db = get_db()
    db.session.add(technician)
    db.session.commit()
    return jsonify({'message': 'Worker added successfully'}), 201

@maintenance_bp.route('/technician/<int:technician_id>', methods=['PUT'])
@login_required
def update_technician(technician_id):
    technician = Technician.query.get(technician_id)
    if not technician:
        return jsonify({'message': 'Technician not found'}), 404

    data = request.get_json()

    if 'skills' in data:
        technician.set_skills_list(data['skills'])
    if 'availability' in data:
        technician.availability = data['availability']

    db = get_db()
    db.session.commit()
    return jsonify({'message': 'Technician updated successfully'}), 200

@maintenance_bp.route('/dashboard/stats', methods=['GET'])
@login_required
def get_maintenance_stats():
    # Get work order statistics
    total_work_orders = WorkOrder.query.count()
    open_work_orders = WorkOrder.query.filter_by(status='open').count()
    in_progress_work_orders = WorkOrder.query.filter_by(status='in_progress').count()
    completed_work_orders = WorkOrder.query.filter_by(status='completed').count()

    # Get technician statistics
    total_technicians = Technician.query.count()
    available_technicians = Technician.query.filter_by(availability='available').count()

    # Priority breakdown
    emergency_count = WorkOrder.query.filter_by(priority='emergency').count()
    high_count = WorkOrder.query.filter_by(priority='high').count()

    # Category breakdown for maintenance manager
    electrical_orders = WorkOrder.query.filter_by(category='electrical').count()
    plumbing_orders = WorkOrder.query.filter_by(category='plumbing').count()
    hvac_orders = WorkOrder.query.filter_by(category='hvac').count()

    return jsonify({
        'work_orders': {
            'total': total_work_orders,
            'open': open_work_orders,
            'in_progress': in_progress_work_orders,
            'completed': completed_work_orders
        },
        'technicians': {
            'total': total_technicians,
            'available': available_technicians
        },
        'urgent_work_orders': emergency_count + high_count,
        'categories': {
            'electrical': electrical_orders,
            'plumbing': plumbing_orders,
            'hvac': hvac_orders
        }
    }), 200

@maintenance_bp.route('/work-orders/my', methods=['GET'])
@login_required
def get_my_work_orders():
    # Get technician record for current user
    technician = Technician.query.filter_by(user_id=current_user.id).first()
    if not technician:
        return jsonify([]), 200

    # Find work orders assigned to this technician
    # If technician has a specialty, filter by category matching specialty
    query = WorkOrder.query.filter_by(assigned_to=current_user.id)

    if technician.specialty:
        if technician.specialty == 'electrical':
            query = query.filter_by(category='electrical')
        elif technician.specialty == 'plumbing':
            query = query.filter_by(category='plumbing')
        elif technician.specialty == 'hvac':
            query = query.filter_by(category='hvac')

    work_orders = query.order_by(WorkOrder.created_at.desc()).all()

    work_orders_data = []
    for wo in work_orders:
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
            'estimated_hours': wo.estimated_hours,
            'actual_hours': wo.actual_hours,
            'created_at': wo.created_at.isoformat() if wo.created_at else None
        })

    return jsonify(work_orders_data), 200