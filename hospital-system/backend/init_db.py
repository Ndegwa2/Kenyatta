"""
Database initialization script with sample data
"""
from app import app, db
from models import User, Patient, Department, Ticket, CasualWorker

def init_database():
    with app.app_context():
        # Drop all tables and recreate
        db.drop_all()
        db.create_all()
        
        print("Creating sample users...")
        
        # Create admin user
        admin = User(username='admin@hospital.com', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        
        # Create patient user
        patient_user = User(username='patient@hospital.com', role='patient')
        patient_user.set_password('patient123')
        db.session.add(patient_user)
        
        # Create department users
        dept_user1 = User(username='emergency@hospital.com', role='department')
        dept_user1.set_password('dept123')
        db.session.add(dept_user1)
        
        dept_user2 = User(username='cardiology@hospital.com', role='department')
        dept_user2.set_password('dept123')
        db.session.add(dept_user2)
        
        # Create casual worker user
        casual_user = User(username='casual@hospital.com', role='casual')
        casual_user.set_password('casual123')
        db.session.add(casual_user)
        
        db.session.commit()
        
        print("Creating departments...")
        
        # Create departments
        emergency_dept = Department(name='Emergency', user_id=dept_user1.id)
        cardiology_dept = Department(name='Cardiology', user_id=dept_user2.id)
        db.session.add(emergency_dept)
        db.session.add(cardiology_dept)
        db.session.commit()
        
        print("Creating patients...")
        
        # Create patient profile
        patient = Patient(
            name='John Doe',
            age=35,
            condition='Regular checkup',
            user_id=patient_user.id
        )
        db.session.add(patient)
        db.session.commit()
        
        print("Creating sample tickets...")
        
        # Create sample tickets with different priorities and categories
        tickets_data = [
            {
                'title': 'Chest pain and shortness of breath',
                'description': 'Patient experiencing severe chest pain for the past 2 hours',
                'priority': 'critical',
                'category': 'medical',
                'status': 'open',
                'patient_id': patient.id,
                'department_id': emergency_dept.id
            },
            {
                'title': 'Routine blood pressure check',
                'description': 'Monthly blood pressure monitoring appointment',
                'priority': 'low',
                'category': 'medical',
                'status': 'open',
                'patient_id': patient.id,
                'department_id': cardiology_dept.id
            },
            {
                'title': 'Broken wheelchair in waiting area',
                'description': 'Wheelchair #5 has a broken wheel and needs repair',
                'priority': 'medium',
                'category': 'maintenance',
                'status': 'in_progress',
                'patient_id': patient.id,
                'department_id': emergency_dept.id,
                'assigned_to': casual_user.id
            },
            {
                'title': 'Request for medical records',
                'description': 'Patient requesting copies of medical records from last visit',
                'priority': 'low',
                'category': 'administrative',
                'status': 'open',
                'patient_id': patient.id,
                'department_id': cardiology_dept.id
            },
            {
                'title': 'ECG machine malfunction',
                'description': 'ECG machine in room 203 not powering on',
                'priority': 'high',
                'category': 'maintenance',
                'status': 'open',
                'patient_id': patient.id,
                'department_id': cardiology_dept.id
            }
        ]
        
        for ticket_data in tickets_data:
            ticket = Ticket(**ticket_data)
            db.session.add(ticket)
        
        db.session.commit()
        
        print("Creating casual workers...")
        
        # Create casual workers
        workers_data = [
            {'name': 'Mike Johnson', 'task': 'Wheelchair repair', 'user_id': casual_user.id},
            {'name': 'Sarah Williams', 'task': 'Equipment maintenance', 'user_id': casual_user.id},
            {'name': 'David Brown', 'task': 'Facility cleaning', 'user_id': casual_user.id}
        ]
        
        for worker_data in workers_data:
            worker = CasualWorker(**worker_data)
            db.session.add(worker)
        
        db.session.commit()
        
        print("\n✅ Database initialized successfully!")
        print("\n📊 Summary:")
        print(f"  - Users: {User.query.count()}")
        print(f"  - Patients: {Patient.query.count()}")
        print(f"  - Departments: {Department.query.count()}")
        print(f"  - Tickets: {Ticket.query.count()}")
        print(f"  - Casual Workers: {CasualWorker.query.count()}")
        print("\n🔐 Login Credentials:")
        print("  Admin: admin@hospital.com / admin123")
        print("  Patient: patient@hospital.com / patient123")
        print("  Emergency Dept: emergency@hospital.com / dept123")
        print("  Cardiology Dept: cardiology@hospital.com / dept123")
        print("  Casual Worker: casual@hospital.com / casual123")

if __name__ == '__main__':
    init_database()