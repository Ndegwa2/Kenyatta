"""
Database initialization script with sample data for Maintenance Department System
"""
from app import app, db
from models import User, Department, WorkOrder, Technician, Equipment, Patient, Ticket
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta

def init_database():
    with app.app_context():
        # Drop all tables and recreate
        db.drop_all()
        db.create_all()

        print("Creating sample users...")

        # Create admin/manager user
        admin = User(username='admin@hospital.com', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)

        # Create requester users (hospital staff)
        requester1 = User(username='nurse@hospital.com', role='department')
        requester1.set_password('staff123')
        db.session.add(requester1)

        requester2 = User(username='doctor@hospital.com', role='department')
        requester2.set_password('staff123')
        db.session.add(requester2)

        # Create technician users
        tech1 = User(username='electrician@hospital.com', role='technician')
        tech1.set_password('tech123')
        db.session.add(tech1)

        tech2 = User(username='plumber@hospital.com', role='technician')
        tech2.set_password('tech123')
        db.session.add(tech2)

        tech3 = User(username='general@hospital.com', role='technician')
        tech3.set_password('tech123')
        db.session.add(tech3)

        # Create patient users
        patient1 = User(username='patient1@hospital.com', role='patient')
        patient1.set_password('patient123')
        db.session.add(patient1)

        patient2 = User(username='patient2@hospital.com', role='patient')
        patient2.set_password('patient123')
        db.session.add(patient2)

        db.session.commit()

        print("Creating departments...")

        # Create maintenance department
        maintenance_dept = Department(name='Maintenance', user_id=admin.id)
        db.session.add(maintenance_dept)
        db.session.commit()

        print("Creating technicians...")

        # Create technicians
        technician1 = Technician(
            name='Mike Johnson',
            availability='available',
            user_id=tech1.id
        )
        technician1.set_skills_list(['electrical', 'general'])
        db.session.add(technician1)

        technician2 = Technician(
            name='Sarah Davis',
            availability='available',
            user_id=tech2.id
        )
        technician2.set_skills_list(['plumbing', 'hvac'])
        db.session.add(technician2)

        technician3 = Technician(
            name='Tom Wilson',
            availability='available',
            user_id=tech3.id
        )
        technician3.set_skills_list(['machinery', 'facilities', 'general'])
        db.session.add(technician3)

        db.session.commit()

        print("Creating equipment...")

        # Create equipment
        equipment1 = Equipment(
            name='MRI Machine',
            location='Radiology Department - Room 301',
            category='medical_equipment',
            maintenance_schedule='monthly',
            last_maintenance=datetime.utcnow() - timedelta(days=20),
            next_maintenance=datetime.utcnow() + timedelta(days=10)
        )
        db.session.add(equipment1)

        equipment2 = Equipment(
            name='Elevator #1',
            location='Main Building - North Wing',
            category='facilities',
            maintenance_schedule='monthly',
            last_maintenance=datetime.utcnow() - timedelta(days=25),
            next_maintenance=datetime.utcnow() + timedelta(days=5)
        )
        db.session.add(equipment2)

        equipment3 = Equipment(
            name='Ventilation System',
            location='ICU - Floor 3',
            category='hvac',
            maintenance_schedule='quarterly',
            last_maintenance=datetime.utcnow() - timedelta(days=80),
            next_maintenance=datetime.utcnow() + timedelta(days=10)
        )
        db.session.add(equipment3)

        equipment4 = Equipment(
            name='X-Ray Machine',
            location='Emergency Department',
            category='medical_equipment',
            maintenance_schedule='monthly',
            last_maintenance=datetime.utcnow() - timedelta(days=15),
            next_maintenance=datetime.utcnow() + timedelta(days=15)
        )
        db.session.add(equipment4)

        db.session.commit()

        print("Creating departments...")

        # Create hospital departments
        cardiology_dept = Department(name='Cardiology', user_id=requester2.id)  # doctor
        db.session.add(cardiology_dept)

        radiology_dept = Department(name='Radiology', user_id=requester2.id)  # doctor
        db.session.add(radiology_dept)

        emergency_dept = Department(name='Emergency', user_id=requester1.id)  # nurse
        db.session.add(emergency_dept)

        db.session.commit()

        print("Creating patients...")

        # Create patients
        patient_profile1 = Patient(
            name='John Smith',
            user_id=patient1.id,
            date_of_birth=datetime(1985, 3, 15),
            age=39,
            gender='Male',
            phone='+1234567890',
            email='john.smith@email.com',
            address='123 Main St',
            city='Nairobi',
            state='Nairobi County',
            zip_code='00100',
            medical_record_number='MRN001',
            emergency_contact_name='Mary Smith',
            emergency_contact_phone='+1234567899',
            emergency_contact_relationship='Wife',
            blood_type='O+',
            allergies='Penicillin',
            chronic_conditions='Hypertension',
            current_medications='Lisinopril 10mg daily',
            condition='Hypertension management',
            insurance_provider='AAR Insurance',
            insurance_policy_number='POL001234',
            insurance_group_number='GRP001'
        )
        db.session.add(patient_profile1)

        patient_profile2 = Patient(
            name='Jane Doe',
            user_id=patient2.id,
            date_of_birth=datetime(1990, 7, 22),
            age=35,
            gender='Female',
            phone='+1234567891',
            email='jane.doe@email.com',
            address='456 Oak Ave',
            city='Nairobi',
            state='Nairobi County',
            zip_code='00200',
            medical_record_number='MRN002',
            emergency_contact_name='Robert Doe',
            emergency_contact_phone='+1234567888',
            emergency_contact_relationship='Husband',
            blood_type='A+',
            allergies='None',
            chronic_conditions='None',
            current_medications='None',
            condition='Routine checkup',
            insurance_provider='Jubilee Insurance',
            insurance_policy_number='POL005678',
            insurance_group_number='GRP002'
        )
        db.session.add(patient_profile2)

        db.session.commit()

        print("Creating sample tickets...")

        # Create sample tickets
        tickets_data = [
            {
                'title': 'Long wait time in Emergency',
                'description': 'Waited over 4 hours to see a doctor in the emergency department',
                'priority': 'high',
                'category': 'administrative',
                'patient_id': patient_profile1.id,
                'department_id': emergency_dept.id,
                'status': 'open'
            },
            {
                'title': 'Billing issue with recent visit',
                'description': 'Received incorrect bill for cardiology consultation',
                'priority': 'medium',
                'category': 'administrative',
                'patient_id': patient_profile2.id,
                'department_id': cardiology_dept.id,
                'status': 'in_progress',
                'assigned_to': requester1.id
            },
            {
                'title': 'MRI results not received',
                'description': 'Had MRI scan last week but haven\'t received results yet',
                'priority': 'high',
                'category': 'medical',
                'patient_id': patient_profile1.id,
                'department_id': radiology_dept.id,
                'status': 'open'
            }
        ]

        for ticket_data in tickets_data:
            ticket = Ticket(**ticket_data)
            db.session.add(ticket)

        db.session.commit()

        print("Creating sample work orders...")

        # Create sample work orders
        work_orders_data = [
            {
                'title': 'Emergency: Elevator Malfunction',
                'description': 'Elevator #1 is stuck between floors 2 and 3. Multiple patients trapped inside.',
                'priority': 'emergency',
                'category': 'facilities',
                'location': 'Main Building - North Wing Elevator',
                'equipment_id': equipment2.id,
                'requester_id': requester1.id,
                'status': 'open'
            },
            {
                'title': 'MRI Machine Calibration',
                'description': 'Monthly calibration and maintenance check for MRI machine',
                'priority': 'high',
                'category': 'machinery',
                'location': 'Radiology Department - Room 301',
                'equipment_id': equipment1.id,
                'requester_id': requester2.id,
                'status': 'assigned',
                'assigned_to': tech3.id,
                'estimated_hours': 4.0
            },
            {
                'title': 'Leaking Faucet in Patient Room',
                'description': 'Faucet in room 205 is leaking continuously, causing water damage to floor',
                'priority': 'medium',
                'category': 'plumbing',
                'location': 'Patient Room 205',
                'requester_id': requester1.id,
                'status': 'open'
            },
            {
                'title': 'HVAC System Filter Replacement',
                'description': 'Quarterly filter replacement for ICU ventilation system',
                'priority': 'medium',
                'category': 'hvac',
                'location': 'ICU - Floor 3',
                'equipment_id': equipment3.id,
                'requester_id': requester2.id,
                'status': 'open',
                'estimated_hours': 2.0
            },
            {
                'title': 'Broken Light Fixture',
                'description': 'Fluorescent light fixture in waiting area is flickering and needs replacement',
                'priority': 'low',
                'category': 'electrical',
                'location': 'Main Waiting Area',
                'requester_id': requester1.id,
                'status': 'completed',
                'assigned_to': tech1.id,
                'estimated_hours': 1.0,
                'actual_hours': 0.8,
                'completed_at': datetime.utcnow()
            },
            {
                'title': 'Wheelchair Repair',
                'description': 'Wheelchair in emergency department has broken wheel and needs immediate repair',
                'priority': 'high',
                'category': 'facilities',
                'location': 'Emergency Department',
                'requester_id': requester1.id,
                'status': 'in_progress',
                'assigned_to': tech3.id,
                'estimated_hours': 1.5
            }
        ]

        for work_order_data in work_orders_data:
            work_order = WorkOrder(**work_order_data)
            db.session.add(work_order)

        db.session.commit()

        print("\n✅ Maintenance Database initialized successfully!")
        print("\n📊 Summary:")
        print(f"  - Users: {User.query.count()}")
        print(f"  - Departments: {Department.query.count()}")
        print(f"  - Patients: {Patient.query.count()}")
        print(f"  - Tickets: {Ticket.query.count()}")
        print(f"  - Work Orders: {WorkOrder.query.count()}")
        print(f"  - Technicians: {Technician.query.count()}")
        print(f"  - Equipment: {Equipment.query.count()}")
        print("\n🔐 Login Credentials:")
        print("  Admin/Manager: admin@hospital.com / admin123")
        print("  Requester (Nurse): nurse@hospital.com / staff123")
        print("  Requester (Doctor): doctor@hospital.com / staff123")
        print("  Patient 1: patient1@hospital.com / patient123")
        print("  Patient 2: patient2@hospital.com / patient123")
        print("  Electrician: electrician@hospital.com / tech123")
        print("  Plumber: plumber@hospital.com / tech123")
        print("  General Tech: general@hospital.com / tech123")

if __name__ == '__main__':
    init_database()