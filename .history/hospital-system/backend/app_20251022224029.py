from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# Configure CORS with credentials support
CORS(app,
     supports_credentials=True,
     origins=["http://localhost:3000", "http://localhost:3001"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configure session settings
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour

# Make db available in app context for routes
app.db = db

# Initialize models after app creation
from models import init_models
init_models(db)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.session_protection = "strong"
login_manager.login_view = "auth.login"

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Create database tables
with app.app_context():
    db.create_all()
    print("Database tables created. Run 'python backend/init_db.py' to populate with sample data.")

# Import routes after app creation to avoid circular imports
from routes import register_blueprints
register_blueprints(app)

# Initialize appointment models
from routes.appointment_routes import init_appointment_models
init_appointment_models(db)

# Initialize medical records models
from routes.medical_records_routes import init_medical_records_models
init_medical_records_models(db)

if __name__ == '__main__':
    app.run(debug=True)