"""
Database initialization script with sample data for Maintenance Department System
"""
from app import app, db
from models import User, Department, WorkOrder, Technician, Equipment, Patient, Ticket, TicketTemplate, Workflow, WorkflowStep
import json
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

        # Create maintenance manager
        maintenance_manager = User(username='maintenance@hospital.com', role='maintenance_manager')
        maintenance_manager.set_password('maint123')
        db.session.add(maintenance_manager)

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

        # Create mechanical technician user
        tech4 = User(username='mechanical@hospital.com', role='technician')
        tech4.set_password('tech123')
        db.session.add(tech4)

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
        maintenance_dept = Department(name='Maintenance', type='maintenance', user_id=maintenance_manager.id)
        db.session.add(maintenance_dept)

        # Create electrical sub-department
        electrical_dept = Department(name='Electrical', type='maintenance', parent_id=maintenance_dept.id, user_id=maintenance_manager.id)
        db.session.add(electrical_dept)

        # Create plumbing sub-department
        plumbing_dept = Department(name='Plumbing', type='maintenance', parent_id=maintenance_dept.id, user_id=maintenance_manager.id)
        db.session.add(plumbing_dept)

        # Create HVAC sub-department
        hvac_dept = Department(name='HVAC', type='maintenance', parent_id=maintenance_dept.id, user_id=maintenance_manager.id)
        db.session.add(hvac_dept)

        db.session.commit()

        print("Creating technicians...")

        # Create technicians with department assignments
        technician1 = Technician(
            name='Mike Johnson',
            availability='available',
            specialty='electrical',
            department_id=electrical_dept.id,
            user_id=tech1.id
        )
        technician1.set_skills_list(['electrical', 'general'])
        db.session.add(technician1)

        technician2 = Technician(
            name='Sarah Davis',
            availability='available',
            specialty='plumbing',
            department_id=plumbing_dept.id,
            user_id=tech2.id
        )
        technician2.set_skills_list(['plumbing', 'hvac'])
        db.session.add(technician2)

        technician3 = Technician(
            name='Tom Wilson',
            availability='available',
            specialty='general',
            department_id=maintenance_dept.id,
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

        # Create sample workflows and templates
        print("Creating sample workflows and templates...")

        # Create Emergency Response Workflow
        emergency_workflow = Workflow(
            name="Emergency Response Workflow",
            description="Automated workflow for critical medical emergencies",
            category="ticket",
            created_by=admin.id
        )
        db.session.add(emergency_workflow)
        db.session.commit()

        # Emergency workflow steps
        trigger_step = WorkflowStep(
            workflow_id=emergency_workflow.id,
            step_order=1,
            name="Emergency Ticket Created",
            description="Trigger when critical priority ticket is created",
            step_type="trigger",
            config=json.dumps({
                "trigger_type": "ticket_created",
                "conditions": [
                    {"type": "priority_match", "value": "critical"}
                ]
            })
        )
        db.session.add(trigger_step)

        condition_step = WorkflowStep(
            workflow_id=emergency_workflow.id,
            step_order=2,
            name="Check Emergency Department",
            description="Check if ticket is from emergency department",
            step_type="condition",
            config=json.dumps({
                "condition_type": "department_check",
                "department_id": emergency_dept.id
            }),
            next_step_id=None  # Will be set after creating action step
        )
        db.session.add(condition_step)

        action_step = WorkflowStep(
            workflow_id=emergency_workflow.id,
            step_order=3,
            name="Auto Assign to Emergency Team",
            description="Automatically assign to available emergency technician",
            step_type="action",
            config=json.dumps({
                "action_type": "assign_ticket",
                "assignment_rule": "auto"
            })
        )
        db.session.add(action_step)

        # Update condition to point to action
        condition_step.next_step_id = action_step.id
        db.session.commit()

        # Create Routine Maintenance Workflow
        maintenance_workflow = Workflow(
            name="Routine Maintenance Workflow",
            description="Standard workflow for facility maintenance requests",
            category="ticket",
            created_by=admin.id
        )
        db.session.add(maintenance_workflow)
        db.session.commit()

        # Maintenance workflow steps
        maint_trigger = WorkflowStep(
            workflow_id=maintenance_workflow.id,
            step_order=1,
            name="Maintenance Request Created",
            description="Trigger when low/medium priority maintenance ticket is created",
            step_type="trigger",
            config=json.dumps({
                "trigger_type": "ticket_created",
                "conditions": [
                    {"type": "category_match", "value": "facilities"},
                    {"type": "priority_match", "value": "low"}
                ]
            })
        )
        db.session.add(maint_trigger)

        maint_condition = WorkflowStep(
            workflow_id=maintenance_workflow.id,
            step_order=2,
            name="Check Time Elapsed",
            description="Wait 2 hours before auto-assigning",
            step_type="condition",
            config=json.dumps({
                "condition_type": "time_elapsed",
                "hours": 2
            })
        )
        db.session.add(maint_condition)

        maint_action = WorkflowStep(
            workflow_id=maintenance_workflow.id,
            step_order=3,
            name="Assign to Maintenance Team",
            description="Assign to available maintenance technician",
            step_type="action",
            config=json.dumps({
                "action_type": "assign_ticket",
                "assignment_rule": "auto"
            })
        )
        db.session.add(maint_action)

        # Update condition to point to action
        maint_condition.next_step_id = maint_action.id
        db.session.commit()

        # Create Emergency Response Template
        emergency_template = TicketTemplate(
            name="Emergency Response",
            description="Critical medical emergency requiring immediate attention",
            category="medical",
            priority="critical",
            department_id=emergency_dept.id,
            custom_fields=json.dumps({
                "location": {
                    "type": "text",
                    "label": "Location",
                    "placeholder": "Room/building where emergency occurred",
                    "required": True
                },
                "patient_condition": {
                    "type": "textarea",
                    "label": "Patient Condition",
                    "placeholder": "Describe the patient's current condition",
                    "required": True
                },
                "equipment_needed": {
                    "type": "text",
                    "label": "Equipment Needed",
                    "placeholder": "Medical equipment required",
                    "required": False
                },
                "urgency_level": {
                    "type": "select",
                    "label": "Urgency Level",
                    "options": [
                        {"value": "immediate", "label": "Immediate - Life Threatening"},
                        {"value": "urgent", "label": "Urgent - Requires Quick Response"},
                        {"value": "critical", "label": "Critical - Needs Attention Soon"}
                    ],
                    "required": True
                }
            }),
            workflow_id=emergency_workflow.id,
            created_by=admin.id
        )
        db.session.add(emergency_template)

        # Create Facility Maintenance Template
        maintenance_template = TicketTemplate(
            name="Facility Maintenance Request",
            description="Report facility issues like plumbing, electrical, or general repairs",
            category="facilities",
            priority="low",
            department_id=maintenance_dept.id,
            custom_fields=json.dumps({
                "location": {
                    "type": "text",
                    "label": "Location",
                    "placeholder": "Specific room or area needing maintenance",
                    "required": True
                },
                "issue_type": {
                    "type": "select",
                    "label": "Type of Issue",
                    "options": [
                        {"value": "plumbing", "label": "Plumbing"},
                        {"value": "electrical", "label": "Electrical"},
                        {"value": "hvac", "label": "HVAC/Heating"},
                        {"value": "structural", "label": "Structural"},
                        {"value": "cleaning", "label": "Cleaning"},
                        {"value": "other", "label": "Other"}
                    ],
                    "required": True
                },
                "description": {
                    "type": "textarea",
                    "label": "Detailed Description",
                    "placeholder": "Describe the issue in detail",
                    "required": True
                },
                "urgency": {
                    "type": "select",
                    "label": "Urgency",
                    "options": [
                        {"value": "low", "label": "Low - Can wait"},
                        {"value": "medium", "label": "Medium - Needs attention soon"},
                        {"value": "high", "label": "High - Urgent repair needed"}
                    ],
                    "required": True
                },
                "safety_concern": {
                    "type": "select",
                    "label": "Safety Concern",
                    "options": [
                        {"value": "yes", "label": "Yes - Poses safety risk"},
                        {"value": "no", "label": "No - Not a safety issue"}
                    ],
                    "required": True
                }
            }),
            workflow_id=maintenance_workflow.id,
            created_by=admin.id
        )
        # Create Emergency Maintenance Workflow
        emergency_maint_workflow = Workflow(
            name="Emergency Maintenance Response Workflow",
            description="Handles critical maintenance emergencies requiring immediate attention",
            category="ticket",
            created_by=admin.id
        )
        db.session.add(emergency_maint_workflow)
        db.session.commit()

        # Emergency maintenance workflow steps
        emergency_trigger = WorkflowStep(
            workflow_id=emergency_maint_workflow.id,
            step_order=1,
            name="Emergency Maintenance Issue",
            description="Trigger when critical maintenance emergency is reported",
            step_type="trigger",
            config=json.dumps({
                "trigger_type": "ticket_created",
                "conditions": [
                    {"type": "priority_match", "value": "critical"},
                    {"type": "category_match", "value": "facilities"}
                ]
            })
        )
        db.session.add(emergency_trigger)

        emergency_condition = WorkflowStep(
            workflow_id=emergency_maint_workflow.id,
            step_order=2,
            name="Safety Hazard Check",
            description="Verify if issue poses immediate safety risk",
            step_type="condition",
            config=json.dumps({
                "condition_type": "status_check",
                "status": "open"  # All critical maintenance issues are safety priorities
            })
        )
        db.session.add(emergency_condition)

        emergency_action = WorkflowStep(
            workflow_id=emergency_maint_workflow.id,
            step_order=3,
            name="Emergency Technician Assignment",
            description="Assign to senior technician with emergency response capability",
            step_type="action",
            config=json.dumps({
                "action_type": "assign_ticket",
                "assignment_rule": "auto"
            })
        )
        db.session.add(emergency_action)

        emergency_condition.next_step_id = emergency_action.id
        db.session.commit()

        # Create Equipment Failure Workflow
        equipment_workflow = Workflow(
            name="Critical Equipment Failure Workflow",
            description="Handles urgent medical equipment failures with immediate response",
            category="ticket",
            created_by=admin.id
        )
        db.session.add(equipment_workflow)
        db.session.commit()

        # Equipment failure workflow steps
        equip_trigger = WorkflowStep(
            workflow_id=equipment_workflow.id,
            step_order=1,
            name="Equipment Failure Reported",
            description="Trigger when critical medical equipment fails",
            step_type="trigger",
            config=json.dumps({
                "trigger_type": "ticket_created",
                "conditions": [
                    {"type": "category_match", "value": "facilities"},
                    {"type": "priority_match", "value": "high"}
                ]
            })
        )
        db.session.add(equip_trigger)

        equip_condition = WorkflowStep(
            workflow_id=equipment_workflow.id,
            step_order=2,
            name="Check Safety Impact",
            description="Determine if equipment failure affects patient safety",
            step_type="condition",
            config=json.dumps({
                "condition_type": "status_check",
                "status": "open"  # All high priority equipment issues are treated as safety concerns
            })
        )
        db.session.add(equip_condition)

        equip_action = WorkflowStep(
            workflow_id=equipment_workflow.id,
            step_order=3,
            name="Emergency Equipment Response",
            description="Assign to senior technician and escalate priority",
            step_type="action",
            config=json.dumps({
                "action_type": "escalate_ticket"
            })
        )
        db.session.add(equip_action)

        equip_condition.next_step_id = equip_action.id
        db.session.commit()

        # Create Administrative Escalation Workflow
        admin_workflow = Workflow(
            name="Administrative Escalation Workflow",
            description="Handles billing, insurance, and administrative complaints with proper escalation",
            category="ticket",
            created_by=admin.id
        )
        db.session.add(admin_workflow)
        db.session.commit()

        # Administrative workflow steps
        admin_trigger = WorkflowStep(
            workflow_id=admin_workflow.id,
            step_order=1,
            name="Administrative Issue Reported",
            description="Trigger when administrative or billing issues are reported",
            step_type="trigger",
            config=json.dumps({
                "trigger_type": "ticket_created",
                "conditions": [
                    {"type": "category_match", "value": "administrative"}
                ]
            })
        )
        db.session.add(admin_trigger)

        admin_condition = WorkflowStep(
            workflow_id=admin_workflow.id,
            step_order=2,
            name="Check Resolution Time",
            description="Monitor if issue remains unresolved after 24 hours",
            step_type="condition",
            config=json.dumps({
                "condition_type": "time_elapsed",
                "hours": 24
            })
        )
        db.session.add(admin_condition)

        admin_action = WorkflowStep(
            workflow_id=admin_workflow.id,
            step_order=3,
            name="Escalate to Management",
            description="Escalate unresolved administrative issues to hospital management",
            step_type="action",
            config=json.dumps({
                "action_type": "send_notification",
                "user_id": admin.id,
                "title": "Administrative Issue Escalation",
                "message": "Administrative issue requires management attention",
                "notification_type": "warning"
            })
        )
        db.session.add(admin_action)

        admin_condition.next_step_id = admin_action.id
        db.session.commit()

        # Create Follow-up Workflow first
        followup_workflow = Workflow(
            name="Patient Care Follow-up Workflow",
            description="Handles patient care follow-up and nursing concerns",
            category="ticket",
            created_by=admin.id
        )
        db.session.add(followup_workflow)
        db.session.commit()

        # Create Patient Care Follow-up Template
        care_template = TicketTemplate(
            name="Patient Care Follow-up",
            description="Report patient care issues, medication concerns, or treatment follow-up needs",
            category="medical",
            priority="medium",
            department_id=emergency_dept.id,
            custom_fields=json.dumps({
                "patient_room": {
                    "type": "text",
                    "label": "Patient Room Number",
                    "placeholder": "Room/building where patient is located",
                    "required": True
                },
                "care_type": {
                    "type": "select",
                    "label": "Type of Care Issue",
                    "options": [
                        {"value": "medication", "label": "Medication Issue"},
                        {"value": "treatment", "label": "Treatment Concern"},
                        {"value": "nursing_care", "label": "Nursing Care"},
                        {"value": "follow_up", "label": "Follow-up Required"},
                        {"value": "other", "label": "Other"}
                    ],
                    "required": True
                },
                "severity": {
                    "type": "select",
                    "label": "Severity Level",
                    "options": [
                        {"value": "mild", "label": "Mild - Monitor"},
                        {"value": "moderate", "label": "Moderate - Address Soon"},
                        {"value": "severe", "label": "Severe - Immediate Attention"}
                    ],
                    "required": True
                },
                "description": {
                    "type": "textarea",
                    "label": "Detailed Description",
                    "placeholder": "Describe the care issue in detail",
                    "required": True
                },
                "immediate_action_needed": {
                    "type": "select",
                    "label": "Immediate Action Required",
                    "options": [
                        {"value": "yes", "label": "Yes - Immediate intervention needed"},
                        {"value": "no", "label": "No - Can be addressed in normal timeframe"}
                    ],
                    "required": True
                }
            }),
            workflow_id=followup_workflow.id,
            created_by=admin.id
        )
        db.session.add(care_template)

        # Create Critical Equipment Failure Template
        equip_template = TicketTemplate(
            name="Critical Equipment Failure",
            description="Report failures of critical medical equipment affecting patient care",
            category="facilities",
            priority="high",
            department_id=maintenance_dept.id,
            custom_fields=json.dumps({
                "equipment_name": {
                    "type": "text",
                    "label": "Equipment Name/Model",
                    "placeholder": "e.g., MRI Machine, X-Ray Unit, Ventilator",
                    "required": True
                },
                "location": {
                    "type": "text",
                    "label": "Equipment Location",
                    "placeholder": "Room/department where equipment is located",
                    "required": True
                },
                "failure_type": {
                    "type": "select",
                    "label": "Type of Failure",
                    "options": [
                        {"value": "power_failure", "label": "Power/Electrical Failure"},
                        {"value": "mechanical", "label": "Mechanical Breakdown"},
                        {"value": "software_error", "label": "Software/Computer Error"},
                        {"value": "calibration", "label": "Calibration/Accuracy Issue"},
                        {"value": "other", "label": "Other"}
                    ],
                    "required": True
                },
                "patient_impact": {
                    "type": "select",
                    "label": "Patient Care Impact",
                    "options": [
                        {"value": "no_impact", "label": "No current impact"},
                        {"value": "delayed_care", "label": "Delayed care/treatment"},
                        {"value": "alternative_needed", "label": "Alternative equipment needed"},
                        {"value": "critical_backup", "label": "Critical - backup equipment required"}
                    ],
                    "required": True
                },
                "error_messages": {
                    "type": "textarea",
                    "label": "Error Messages/Codes",
                    "placeholder": "Any error codes, messages, or symptoms observed",
                    "required": False
                },
                "backup_available": {
                    "type": "select",
                    "label": "Backup Equipment Available",
                    "options": [
                        {"value": "yes", "label": "Yes - backup is available"},
                        {"value": "no", "label": "No - no backup available"},
                        {"value": "unknown", "label": "Unknown"}
                    ],
                    "required": True
                }
            }),
            workflow_id=equipment_workflow.id,
            created_by=admin.id
        )
        db.session.add(equip_template)

        # Create Administrative Complaint Template
        admin_template = TicketTemplate(
            name="Administrative Complaint",
            description="Report billing issues, insurance problems, or administrative concerns",
            category="administrative",
            priority="medium",
            department_id=cardiology_dept.id,  # Administrative department
            custom_fields=json.dumps({
                "complaint_type": {
                    "type": "select",
                    "label": "Type of Complaint",
                    "options": [
                        {"value": "billing_error", "label": "Billing/Invoicing Error"},
                        {"value": "insurance_issue", "label": "Insurance Claim Problem"},
                        {"value": "appointment_scheduling", "label": "Appointment Scheduling Issue"},
                        {"value": "staff_conduct", "label": "Staff Conduct/Behavior"},
                        {"value": "facility_cleanliness", "label": "Facility Cleanliness"},
                        {"value": "communication", "label": "Communication Problem"},
                        {"value": "other", "label": "Other"}
                    ],
                    "required": True
                },
                "date_of_incident": {
                    "type": "date",
                    "label": "Date of Incident",
                    "required": True
                },
                "involved_staff": {
                    "type": "text",
                    "label": "Staff Member(s) Involved",
                    "placeholder": "Name(s) of staff involved (if applicable)",
                    "required": False
                },
                "financial_impact": {
                    "type": "select",
                    "label": "Financial Impact",
                    "options": [
                        {"value": "none", "label": "No financial impact"},
                        {"value": "under_100", "label": "Under $100"},
                        {"value": "100_500", "label": "$100 - $500"},
                        {"value": "over_500", "label": "Over $500"}
                    ],
                    "required": True
                },
                "previous_contact": {
                    "type": "select",
                    "label": "Previous Contact Attempted",
                    "options": [
                        {"value": "yes", "label": "Yes - already contacted department"},
                        {"value": "no", "label": "No - first contact"}
                    ],
                    "required": True
                },
                "resolution_requested": {
                    "type": "textarea",
                    "label": "Requested Resolution",
                    "placeholder": "What outcome are you seeking?",
                    "required": True
                }
            }),
            workflow_id=admin_workflow.id,
            created_by=admin.id
        )
        db.session.add(admin_template)
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
        print("  Maintenance Manager: maintenance@hospital.com / maint123")
        print("  Requester (Nurse): nurse@hospital.com / staff123")
        print("  Requester (Doctor): doctor@hospital.com / staff123")
        print("  Patient 1: patient1@hospital.com / patient123")
        print("  Patient 2: patient2@hospital.com / patient123")
        print("  Electrician: electrician@hospital.com / tech123")
        print("  Plumber: plumber@hospital.com / tech123")
        print("  General Tech: general@hospital.com / tech123")

if __name__ == '__main__':
    init_database()