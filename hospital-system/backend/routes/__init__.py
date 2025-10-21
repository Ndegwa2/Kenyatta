from .auth_routes import auth_bp
from .patient_routes import patient_bp
from .department_routes import department_bp
from .maintenance_routes import maintenance_bp
from .admin_routes import admin_bp
from .ticket_routes import ticket_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(patient_bp, url_prefix='/patient')
    app.register_blueprint(department_bp, url_prefix='/department')
    app.register_blueprint(maintenance_bp, url_prefix='/maintenance')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(ticket_bp, url_prefix='/ticket')