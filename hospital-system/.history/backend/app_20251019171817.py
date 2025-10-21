from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Make db available in app context for routes
app.db = db

# Initialize models after app creation
from models import init_models
init_models(db)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.query.get(int(user_id))

# Create database tables
with app.app_context():
    db.create_all()

    # Create sample users for testing
    from models import User

    # Check if users already exist
    if not User.query.filter_by(username='admin@hospital.com').first():
        admin = User(username='admin@hospital.com', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)

        patient = User(username='patient@hospital.com', role='patient')
        patient.set_password('patient123')
        db.session.add(patient)

        department = User(username='dept@hospital.com', role='department')
        department.set_password('dept123')
        db.session.add(department)

        casual = User(username='casual@hospital.com', role='casual')
        casual.set_password('casual123')
        db.session.add(casual)

        db.session.commit()
        print("Sample users created!")

# Import routes after app creation to avoid circular imports
from routes import register_blueprints
register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True)