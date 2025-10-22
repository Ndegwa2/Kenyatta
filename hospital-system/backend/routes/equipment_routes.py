from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Equipment, WorkOrder
from datetime import datetime, timedelta

def get_db():
    return current_app.db

equipment_bp = Blueprint('equipment', __name__)

# Get all equipment
@equipment_bp.route('/', methods=['GET'])
@login_required
def get_equipment():
    equipment = Equipment.query.all()
    return jsonify([{
        'id': eq.id,
        'name': eq.name,
        'location': eq.location,
        'category': eq.category,
        'maintenance_schedule': eq.maintenance_schedule,
        'last_maintenance': eq.last_maintenance.isoformat() if eq.last_maintenance else None,
        'next_maintenance': eq.next_maintenance.isoformat() if eq.next_maintenance else None,
        'created_at': eq.created_at.isoformat() if eq.created_at else None,
        'updated_at': eq.updated_at.isoformat() if eq.updated_at else None
    } for eq in equipment]), 200

# Get equipment by ID
@equipment_bp.route('/<int:equipment_id>', methods=['GET'])
@login_required
def get_equipment_by_id(equipment_id):
    equipment = Equipment.query.get(equipment_id)
    if not equipment:
        return jsonify({'message': 'Equipment not found'}), 404

    # Get related work orders
    work_orders = WorkOrder.query.filter_by(equipment_id=equipment_id).order_by(WorkOrder.created_at.desc()).all()
    work_orders_data = [{
        'id': wo.id,
        'title': wo.title,
        'status': wo.status,
        'priority': wo.priority,
        'created_at': wo.created_at.isoformat() if wo.created_at else None
    } for wo in work_orders]

    return jsonify({
        'id': equipment.id,
        'name': equipment.name,
        'location': equipment.location,
        'category': equipment.category,
        'maintenance_schedule': equipment.maintenance_schedule,
        'last_maintenance': equipment.last_maintenance.isoformat() if equipment.last_maintenance else None,
        'next_maintenance': equipment.next_maintenance.isoformat() if equipment.next_maintenance else None,
        'created_at': equipment.created_at.isoformat() if equipment.created_at else None,
        'updated_at': equipment.updated_at.isoformat() if equipment.updated_at else None,
        'work_orders': work_orders_data
    }), 200

# Create new equipment
@equipment_bp.route('/', methods=['POST'])
@login_required
def create_equipment():
    data = request.get_json()

    equipment = Equipment(
        name=data['name'],
        location=data['location'],
        category=data['category'],
        maintenance_schedule=data.get('maintenance_schedule')
    )

    # Calculate next maintenance date if schedule is provided
    if equipment.maintenance_schedule:
        equipment.next_maintenance = calculate_next_maintenance(equipment.maintenance_schedule)

    db = get_db()
    db.session.add(equipment)
    db.session.commit()

    return jsonify({
        'message': 'Equipment created successfully',
        'equipment_id': equipment.id
    }), 201

# Update equipment
@equipment_bp.route('/<int:equipment_id>', methods=['PUT'])
@login_required
def update_equipment(equipment_id):
    equipment = Equipment.query.get(equipment_id)
    if not equipment:
        return jsonify({'message': 'Equipment not found'}), 404

    data = request.get_json()

    equipment.name = data.get('name', equipment.name)
    equipment.location = data.get('location', equipment.location)
    equipment.category = data.get('category', equipment.category)
    equipment.maintenance_schedule = data.get('maintenance_schedule', equipment.maintenance_schedule)

    # Recalculate next maintenance if schedule changed
    if 'maintenance_schedule' in data:
        equipment.next_maintenance = calculate_next_maintenance(equipment.maintenance_schedule) if equipment.maintenance_schedule else None

    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Equipment updated successfully'}), 200

# Record maintenance completion
@equipment_bp.route('/<int:equipment_id>/maintenance', methods=['POST'])
@login_required
def record_maintenance(equipment_id):
    equipment = Equipment.query.get(equipment_id)
    if not equipment:
        return jsonify({'message': 'Equipment not found'}), 404

    data = request.get_json()
    maintenance_date = data.get('maintenance_date')

    if maintenance_date:
        equipment.last_maintenance = datetime.fromisoformat(maintenance_date.replace('Z', '+00:00'))
    else:
        equipment.last_maintenance = datetime.utcnow()

    # Calculate next maintenance
    if equipment.maintenance_schedule:
        equipment.next_maintenance = calculate_next_maintenance(equipment.maintenance_schedule, equipment.last_maintenance)

    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Maintenance recorded successfully'}), 200

# Get equipment due for maintenance
@equipment_bp.route('/due-for-maintenance', methods=['GET'])
@login_required
def get_equipment_due():
    now = datetime.utcnow()
    # Equipment due within the next 30 days
    due_date = now + timedelta(days=30)

    equipment = Equipment.query.filter(
        Equipment.next_maintenance.isnot(None),
        Equipment.next_maintenance <= due_date
    ).all()

    return jsonify([{
        'id': eq.id,
        'name': eq.name,
        'location': eq.location,
        'category': eq.category,
        'next_maintenance': eq.next_maintenance.isoformat() if eq.next_maintenance else None,
        'days_until_due': (eq.next_maintenance - now).days if eq.next_maintenance else None
    } for eq in equipment]), 200

# Delete equipment
@equipment_bp.route('/<int:equipment_id>', methods=['DELETE'])
@login_required
def delete_equipment(equipment_id):
    equipment = Equipment.query.get(equipment_id)
    if not equipment:
        return jsonify({'message': 'Equipment not found'}), 404

    # Check if equipment has associated work orders
    work_orders_count = WorkOrder.query.filter_by(equipment_id=equipment_id).count()
    if work_orders_count > 0:
        return jsonify({'message': 'Cannot delete equipment with associated work orders'}), 400

    db = get_db()
    db.session.delete(equipment)
    db.session.commit()

    return jsonify({'message': 'Equipment deleted successfully'}), 200

def calculate_next_maintenance(schedule, from_date=None):
    """Calculate next maintenance date based on schedule"""
    base_date = from_date or datetime.utcnow()

    if schedule == 'monthly':
        return base_date + timedelta(days=30)
    elif schedule == 'quarterly':
        return base_date + timedelta(days=90)
    elif schedule == 'annual':
        return base_date + timedelta(days=365)
    else:
        return None