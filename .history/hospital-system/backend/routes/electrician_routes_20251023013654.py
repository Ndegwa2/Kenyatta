from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Equipment, WorkOrder, User
from datetime import datetime, timedelta
import random

def get_db():
    return current_app.db

electrician_bp = Blueprint('electrician', __name__)

# Get electrician dashboard stats
@electrician_bp.route('/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    # Mock data for electrician dashboard
    stats = {
        'totalWorkOrders': random.randint(15, 25),
        'openWorkOrders': random.randint(5, 10),
        'inProgressWorkOrders': random.randint(3, 8),
        'completedWorkOrders': random.randint(8, 15),
        'generatorsOnline': random.randint(1, 3),
        'upsHealth': random.randint(70, 95)
    }
    return jsonify(stats), 200

# Get preventive maintenance schedule
@electrician_bp.route('/preventive-maintenance', methods=['GET'])
@login_required
def get_preventive_maintenance():
    # Mock preventive maintenance data
    maintenance_tasks = [
        {
            'id': 1,
            'date': '24 Oct',
            'title': 'Generator 2 — Oil change',
            'assigned': 'Eng. Mwangi',
            'status': 'scheduled'
        },
        {
            'id': 2,
            'date': '25 Oct',
            'title': 'Main UPS — Battery health check',
            'assigned': 'Eng. Achieng',
            'status': 'scheduled'
        },
        {
            'id': 3,
            'date': '27 Oct',
            'title': 'ICU AC — Filter replacement',
            'assigned': 'Eng. Otieno',
            'status': 'scheduled'
        },
        {
            'id': 4,
            'date': '29 Oct',
            'title': 'Main switchboard — Thermographic scan',
            'assigned': 'Eng. Njeri',
            'status': 'scheduled'
        }
    ]
    return jsonify(maintenance_tasks), 200

# Get energy usage data
@electrician_bp.route('/energy-usage', methods=['GET'])
@login_required
def get_energy_usage():
    # Mock energy usage data for 24 hours
    energy_data = []
    base_value = 150

    for i in range(24):
        # Simulate daily energy usage pattern
        hour_factor = 1 + 0.5 * (1 if i >= 8 and i <= 18 else 0.3)  # Higher during day
        variation = random.uniform(-20, 20)
        value = max(80, base_value * hour_factor + variation)

        energy_data.append({
            'time': f"{i:02d}:00",
            'value': round(value, 1)
        })

    return jsonify(energy_data), 200

# Get generators status
@electrician_bp.route('/generators', methods=['GET'])
@login_required
def get_generators():
    # Mock generators data
    generators = [
        {
            'id': 1,
            'name': 'Generator 1 - Main Building',
            'status': 'online',
            'fuelLevel': random.randint(80, 95),
            'runtime': round(random.uniform(1.5, 3.5), 1),
            'load': random.randint(50, 70),
            'lastService': '15 Oct 2025',
            'nextService': '15 Nov 2025'
        },
        {
            'id': 2,
            'name': 'Generator 2 - Emergency Wing',
            'status': 'standby',
            'fuelLevel': random.randint(85, 98),
            'runtime': 0.0,
            'load': 0,
            'lastService': '12 Oct 2025',
            'nextService': '12 Nov 2025'
        },
        {
            'id': 3,
            'name': 'Generator 3 - ICU',
            'status': 'maintenance',
            'fuelLevel': random.randint(30, 50),
            'runtime': round(random.uniform(0.5, 1.5), 1),
            'load': 0,
            'lastService': '20 Oct 2025',
            'nextService': '20 Nov 2025'
        }
    ]
    return jsonify(generators), 200

# Get UPS systems status
@electrician_bp.route('/ups-systems', methods=['GET'])
@login_required
def get_ups_systems():
    # Mock UPS systems data
    ups_systems = [
        {
            'id': 1,
            'name': 'Main UPS Rack A',
            'status': 'healthy',
            'batteryHealth': random.randint(90, 98),
            'load': random.randint(35, 50),
            'runtime': round(random.uniform(7, 9), 1)
        },
        {
            'id': 2,
            'name': 'Server Room UPS',
            'status': 'warning',
            'batteryHealth': random.randint(70, 85),
            'load': random.randint(65, 80),
            'runtime': round(random.uniform(3, 5), 1)
        },
        {
            'id': 3,
            'name': 'ICU Critical Systems',
            'status': 'critical',
            'batteryHealth': random.randint(35, 55),
            'load': random.randint(80, 95),
            'runtime': round(random.uniform(1.5, 3), 1)
        }
    ]
    return jsonify(ups_systems), 200

# Get power distribution status
@electrician_bp.route('/power-distribution', methods=['GET'])
@login_required
def get_power_distribution():
    # Mock power distribution data
    distribution = {
        'mainBoard': [
            {'phase': 'A', 'voltage': random.randint(215, 225), 'status': 'online'},
            {'phase': 'B', 'voltage': random.randint(212, 222), 'status': 'online'},
            {'phase': 'C', 'voltage': random.randint(218, 228), 'status': 'online'}
        ],
        'emergencyCircuits': [
            {'name': 'ICU', 'status': 'online'},
            {'name': 'Operating Rooms', 'status': 'online'},
            {'name': 'Backup Generator', 'status': 'standby'}
        ]
    }
    return jsonify(distribution), 200

# Get assets data
@electrician_bp.route('/assets', methods=['GET'])
@login_required
def get_assets():
    # Mock assets data
    assets = [
        {
            'id': 1,
            'name': 'Generator 1',
            'status': 'ok',
            'location': 'Main Building',
            'category': 'Electrical',
            'lastService': '15 Oct 2025',
            'nextService': '15 Nov 2025'
        },
        {
            'id': 2,
            'name': 'UPS Rack',
            'status': 'attention',
            'location': 'Server Room',
            'category': 'Electrical',
            'lastService': '10 Oct 2025',
            'nextService': '10 Nov 2025'
        },
        {
            'id': 3,
            'name': 'Air Conditioning Unit 1',
            'status': 'ok',
            'location': 'Main Building',
            'category': 'HVAC',
            'lastService': '20 Oct 2025',
            'nextService': '20 Nov 2025'
        },
        {
            'id': 4,
            'name': 'Elevator Control Panel',
            'status': 'attention',
            'location': 'Emergency Wing',
            'category': 'Electrical',
            'lastService': '18 Oct 2025',
            'nextService': '18 Nov 2025'
        },
        {
            'id': 5,
            'name': 'Water Pump Station',
            'status': 'critical',
            'location': 'Basement',
            'category': 'Mechanical',
            'lastService': '25 Oct 2025',
            'nextService': '25 Nov 2025'
        },
        {
            'id': 6,
            'name': 'Fire Alarm System',
            'status': 'ok',
            'location': 'All Floors',
            'category': 'Safety',
            'lastService': '22 Oct 2025',
            'nextService': '22 Nov 2025'
        }
    ]
    return jsonify(assets), 200

# Get reports data
@electrician_bp.route('/reports', methods=['GET'])
@login_required
def get_reports():
    # Mock reports data
    reports = {
        'powerConsumption': {
            'thisMonth': round(random.uniform(11500, 13500), 0),
            'vsLastMonth': round(random.uniform(5, 12), 1),
            'trend': 'up'
        },
        'maintenancePerformance': {
            'completed': random.randint(85, 95),
            'onTime': random.randint(70, 85)
        },
        'systemAlerts': {
            'critical': random.randint(0, 5),
            'warnings': random.randint(5, 15)
        },
        'costAnalysis': {
            'monthlyCost': round(random.uniform(7500, 9500), 0),
            'budgetUsed': random.randint(60, 80)
        }
    }
    return jsonify(reports), 200

# Get energy trend data
@electrician_bp.route('/energy-trend', methods=['GET'])
@login_required
def get_energy_trend():
    # Mock energy trend data for charts
    trend_data = []
    base_value = 140

    for i in range(30):  # 30 days
        variation = random.uniform(-15, 15)
        value = max(100, base_value + variation + (i % 7) * 5)  # Weekly pattern
        trend_data.append({
            'day': f"Day {i+1}",
            'value': round(value, 1)
        })

    return jsonify(trend_data), 200

# Get equipment uptime data
@electrician_bp.route('/equipment-uptime', methods=['GET'])
@login_required
def get_equipment_uptime():
    # Mock uptime data
    uptime = {
        'percentage': random.randint(94, 98),
        'totalHours': 720,  # 30 days
        'downtimeHours': random.randint(10, 20)
    }
    return jsonify(uptime), 200

# Update generator status
@electrician_bp.route('/generators/<int:generator_id>/status', methods=['PUT'])
@login_required
def update_generator_status(generator_id):
    data = request.get_json()
    # In a real app, this would update the database
    return jsonify({
        'message': f'Generator {generator_id} status updated to {data.get("status")}',
        'success': True
    }), 200

# Schedule maintenance
@electrician_bp.route('/maintenance/schedule', methods=['POST'])
@login_required
def schedule_maintenance():
    data = request.get_json()
    # In a real app, this would create a maintenance record
    return jsonify({
        'message': 'Maintenance scheduled successfully',
        'maintenance_id': random.randint(1000, 9999)
    }), 201

# Get alerts
@electrician_bp.route('/alerts', methods=['GET'])
@login_required
def get_alerts():
    # Mock alerts data
    alerts = [
        {
            'id': 1,
            'type': 'warning',
            'message': 'Generator 3 fuel level low',
            'action': 'Refuel',
            'timestamp': '2025-10-22T10:30:00Z'
        },
        {
            'id': 2,
            'type': 'info',
            'message': 'Monthly test scheduled for tomorrow',
            'action': 'View Schedule',
            'timestamp': '2025-10-22T09:15:00Z'
        },
        {
            'id': 3,
            'type': 'critical',
            'message': 'UPS Battery health critical in ICU',
            'action': 'Replace Battery',
            'timestamp': '2025-10-22T08:45:00Z'
        }
    ]
    return jsonify(alerts), 200