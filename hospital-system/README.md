# Hospital Management System

A full-stack hospital management system with role-based access control.

## Features

- Role-based authentication (Patient, Department, Admin, Casual Worker)
- Ticket management system
- Patient profiles and department assignments
- Admin dashboard with statistics
- Maintenance and casual worker management

## Tech Stack

- Backend: Flask, SQLAlchemy, Flask-Login
- Frontend: React, React Router
- Database: SQLite

## Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd hospital-system/backend
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the Flask app:
   ```
   python app.py
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd hospital-system/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React app:
   ```
   npm start
   ```

## Usage

- Access the application at `http://localhost:3000`
- Login with appropriate credentials based on your role
- Use the dashboards to manage tickets, profiles, and system data