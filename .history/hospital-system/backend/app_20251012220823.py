from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)
CORS(app)

# Import routes after app creation to avoid circular imports
from routes import auth_routes, patient_routes, department_routes, maintenance_routes, admin_routes

if __name__ == '__main__':
    app.run(debug=True)