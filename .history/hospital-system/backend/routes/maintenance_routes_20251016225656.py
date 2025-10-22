from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import CasualWorker

def get_db():
    return current_app.db

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
    db = get_db()
    db.session.add(worker)
    db.session.commit()
    return jsonify({'message': 'Worker added successfully'}), 201