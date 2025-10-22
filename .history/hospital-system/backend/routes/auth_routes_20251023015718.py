from flask import Blueprint, request, jsonify, current_app, session
from flask_login import login_user, logout_user, login_required
from models import User, Technician

def get_db():
    return current_app.db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        # Handle GET requests (redirects from Flask-Login)
        next_url = request.args.get('next', '')
        return jsonify({
            'message': 'Please log in to access this resource',
            'next': next_url,
            'login_required': True
        }), 401
    
    # Handle POST requests (actual login)
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400
    
    db = get_db()
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        session.permanent = True
        login_user(user, remember=True)

        # Get technician specialty if user is a technician
        specialty = None
        if user.role == 'technician':
            technician = Technician.query.filter_by(user_id=user.id).first()
            if technician:
                specialty = technician.specialty

        return jsonify({
            'message': 'Logged in successfully',
            'role': user.role,
            'specialty': specialty
        }), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400

    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'patient')  # default to patient

    if not username or not password:
        return jsonify({'message': 'Username and password required'}), 400

    db = get_db()
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'Username already exists'}), 400

    user = User(username=username, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/status', methods=['GET'])
def auth_status():
    from flask_login import current_user
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'role': current_user.role
            }
        }), 200
    return jsonify({'authenticated': False}), 200