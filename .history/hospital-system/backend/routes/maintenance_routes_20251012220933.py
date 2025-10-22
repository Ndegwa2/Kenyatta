from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import CasualWorker

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/workers', methods=['GET'])
@login_required
def get_workers():
    workers = CasualWorker.query.all()
    return jsonify([{
        'id': w.id,
        'name': w.name,
        'task': w.task
    } for w in workers]), 200

@maintenance_bp.route('/worker', methods=['POST'])
@login_required
def add_worker():
    data = request.get_json()
    worker = CasualWorker(
        name=data['name'],
        task=data['task'],
        user_id=current_user.id
    )
    db.session.add(worker)
    db.session.commit()
    return jsonify({'message': 'Worker added successfully'}), 201