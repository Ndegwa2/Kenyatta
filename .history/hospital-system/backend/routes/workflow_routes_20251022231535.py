from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Workflow, WorkflowStep, WorkflowExecution, TicketTemplate, Ticket, Department, User
from workflow_engine import workflow_engine
import json
from datetime import datetime

def get_db():
    return current_app.db

workflow_bp = Blueprint('workflow', __name__)

# Workflow Management Routes
@workflow_bp.route('/workflows', methods=['GET'])
@login_required
def get_workflows():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    workflows = Workflow.query.filter_by(is_active=True).all()
    workflows_data = []
    for wf in workflows:
        steps_count = WorkflowStep.query.filter_by(workflow_id=wf.id).count()
        executions_count = WorkflowExecution.query.filter_by(workflow_id=wf.id).count()

        workflows_data.append({
            'id': wf.id,
            'name': wf.name,
            'description': wf.description,
            'category': wf.category,
            'steps_count': steps_count,
            'executions_count': executions_count,
            'created_at': wf.created_at.isoformat() if wf.created_at else None,
            'updated_at': wf.updated_at.isoformat() if wf.updated_at else None
        })

    return jsonify(workflows_data), 200

@workflow_bp.route('/workflows', methods=['POST'])
@login_required
def create_workflow():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    workflow = Workflow(
        name=data['name'],
        description=data.get('description'),
        category=data['category'],
        created_by=current_user.id
    )

    db = get_db()
    db.session.add(workflow)
    db.session.commit()

    return jsonify({
        'message': 'Workflow created successfully',
        'workflow_id': workflow.id
    }), 201

@workflow_bp.route('/workflows/<int:workflow_id>', methods=['GET'])
@login_required
def get_workflow_details(workflow_id):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    workflow = Workflow.query.get(workflow_id)
    if not workflow:
        return jsonify({'message': 'Workflow not found'}), 404

    steps = WorkflowStep.query.filter_by(workflow_id=workflow_id).order_by(WorkflowStep.step_order).all()
    steps_data = []
    for step in steps:
        steps_data.append({
            'id': step.id,
            'step_order': step.step_order,
            'name': step.name,
            'description': step.description,
            'step_type': step.step_type,
            'config': json.loads(step.config),
            'next_step_id': step.next_step_id
        })

    return jsonify({
        'id': workflow.id,
        'name': workflow.name,
        'description': workflow.description,
        'category': workflow.category,
        'is_active': workflow.is_active,
        'steps': steps_data,
        'created_at': workflow.created_at.isoformat() if workflow.created_at else None
    }), 200

@workflow_bp.route('/workflows/<int:workflow_id>/steps', methods=['POST'])
@login_required
def add_workflow_step(workflow_id):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    workflow = Workflow.query.get(workflow_id)
    if not workflow:
        return jsonify({'message': 'Workflow not found'}), 404

    data = request.get_json()

    # Get next step order
    max_order = db.session.query(db.func.max(WorkflowStep.step_order)).filter_by(workflow_id=workflow_id).scalar() or 0
    step_order = max_order + 1

    step = WorkflowStep(
        workflow_id=workflow_id,
        step_order=step_order,
        name=data['name'],
        description=data.get('description'),
        step_type=data['step_type'],
        config=json.dumps(data['config']),
        next_step_id=data.get('next_step_id')
    )

    db = get_db()
    db.session.add(step)
    db.session.commit()

    return jsonify({
        'message': 'Step added successfully',
        'step_id': step.id
    }), 201

# Ticket Template Routes
@workflow_bp.route('/templates', methods=['GET'])
@login_required
def get_ticket_templates():
    templates = TicketTemplate.query.filter_by(is_active=True).all()
    templates_data = []

    for template in templates:
        department = Department.query.get(template.department_id) if template.department_id else None
        workflow = Workflow.query.get(template.workflow_id) if template.workflow_id else None

        templates_data.append({
            'id': template.id,
            'name': template.name,
            'description': template.description,
            'category': template.category,
            'priority': template.priority,
            'department': department.name if department else None,
            'workflow': workflow.name if workflow else None,
            'custom_fields': json.loads(template.custom_fields) if template.custom_fields else None,
            'created_at': template.created_at.isoformat() if template.created_at else None
        })

    return jsonify(templates_data), 200

@workflow_bp.route('/templates', methods=['POST'])
@login_required
def create_ticket_template():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    template = TicketTemplate(
        name=data['name'],
        description=data.get('description'),
        category=data['category'],
        priority=data.get('priority', 'medium'),
        department_id=data.get('department_id'),
        custom_fields=json.dumps(data.get('custom_fields', {})),
        workflow_id=data.get('workflow_id'),
        created_by=current_user.id
    )

    db = get_db()
    db.session.add(template)
    db.session.commit()

    return jsonify({
        'message': 'Template created successfully',
        'template_id': template.id
    }), 201

@workflow_bp.route('/templates/<int:template_id>/use', methods=['POST'])
@login_required
def use_ticket_template(template_id):
    template = TicketTemplate.query.get(template_id)
    if not template or not template.is_active:
        return jsonify({'message': 'Template not found'}), 404

    data = request.get_json()

    # Create ticket from template
    ticket = Ticket(
        title=data.get('title', template.name),
        description=data.get('description', template.description),
        category=template.category,
        priority=template.priority,
        department_id=template.department_id,
        patient_id=data['patient_id']
    )

    db = get_db()
    db.session.add(ticket)
    db.session.commit()

    # Trigger workflow if associated
    if template.workflow_id:
        workflow_engine.execute_workflow(template.workflow_id, ticket.id, {
            'template_id': template_id,
            'trigger_type': 'template_used'
        })

    return jsonify({
        'message': 'Ticket created from template',
        'ticket_id': ticket.id
    }), 201

# Workflow Execution Routes
@workflow_bp.route('/executions', methods=['GET'])
@login_required
def get_workflow_executions():
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    executions = WorkflowExecution.query.order_by(WorkflowExecution.started_at.desc()).limit(100).all()
    executions_data = []

    for exec in executions:
        workflow = Workflow.query.get(exec.workflow_id)
        ticket = Ticket.query.get(exec.ticket_id) if exec.ticket_id else None
        current_step = WorkflowStep.query.get(exec.current_step_id) if exec.current_step_id else None

        executions_data.append({
            'id': exec.id,
            'workflow_name': workflow.name if workflow else 'Unknown',
            'ticket_title': ticket.title if ticket else 'N/A',
            'current_step': current_step.name if current_step else 'N/A',
            'status': exec.status,
            'started_at': exec.started_at.isoformat() if exec.started_at else None,
            'completed_at': exec.completed_at.isoformat() if exec.completed_at else None,
            'error_message': exec.error_message
        })

    return jsonify(executions_data), 200

@workflow_bp.route('/executions/<int:execution_id>', methods=['GET'])
@login_required
def get_execution_details(execution_id):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    execution = WorkflowExecution.query.get(execution_id)
    if not execution:
        return jsonify({'message': 'Execution not found'}), 404

    workflow = Workflow.query.get(execution.workflow_id)
    ticket = Ticket.query.get(execution.ticket_id) if execution.ticket_id else None

    return jsonify({
        'id': execution.id,
        'workflow': workflow.name if workflow else 'Unknown',
        'ticket': ticket.title if ticket else 'N/A',
        'status': execution.status,
        'context': json.loads(execution.context) if execution.context else {},
        'started_at': execution.started_at.isoformat() if execution.started_at else None,
        'completed_at': execution.completed_at.isoformat() if execution.completed_at else None,
        'error_message': execution.error_message
    }), 200

# Manual workflow trigger
@workflow_bp.route('/workflows/<int:workflow_id>/trigger', methods=['POST'])
@login_required
def trigger_workflow(workflow_id):
    if current_user.role not in ['admin', 'manager']:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    ticket_id = data.get('ticket_id')

    if not ticket_id:
        return jsonify({'message': 'ticket_id is required'}), 400

    success = workflow_engine.execute_workflow(workflow_id, ticket_id, {
        'trigger_type': 'manual',
        'triggered_by': current_user.id
    })

    if success:
        return jsonify({'message': 'Workflow triggered successfully'}), 200
    else:
        return jsonify({'message': 'Failed to trigger workflow'}), 500