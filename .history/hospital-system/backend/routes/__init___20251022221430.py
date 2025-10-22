from .auth_routes import auth_bp
from .department_routes import department_bp
from .maintenance_routes import maintenance_bp
from .admin_routes import admin_bp
from .work_order_routes import work_order_bp
from .equipment_routes import equipment_bp
from .ticket_routes import ticket_bp
from .patient_routes import patient_bp
from .notification_routes import notification_bp
from .appointment_routes import appointment_bp
from .medical_records_routes import medical_records_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(department_bp, url_prefix='/department')
    app.register_blueprint(maintenance_bp, url_prefix='/maintenance')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(work_order_bp, url_prefix='/work-order')
    app.register_blueprint(equipment_bp, url_prefix='/equipment')
    app.register_blueprint(ticket_bp, url_prefix='/ticket')
    app.register_blueprint(patient_bp, url_prefix='/patient')
    app.register_blueprint(notification_bp, url_prefix='/notification')
    app.register_blueprint(appointment_bp, url_prefix='/appointment')
    app.register_blueprint(medical_records_bp, url_prefix='/medical-records')