from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required
from models import User

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
        login_user(user, remember=True)
        return jsonify({'message': 'Logged in successfully', 'role': user.role}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200