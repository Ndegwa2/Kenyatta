"""
Workflow Engine for Automated Ticket Processing
Handles workflow execution, triggers, conditions, and actions
"""

import json
from datetime import datetime, timedelta
from models import Workflow, WorkflowStep, WorkflowExecution, Ticket, User, Notification
from routes.notification_routes import notify_ticket_assignment, notify_ticket_resolved
from flask import current_app

class WorkflowEngine:
    def __init__(self):
        self.db = None

    def get_db(self):
        if not self.db:
            self.db = current_app.db
        return self.db

    def execute_workflow(self, workflow_id, ticket_id, trigger_data=None):
        """Execute a workflow for a ticket"""
        db = self.get_db()
        workflow = Workflow.query.get(workflow_id)
        if not workflow or not workflow.is_active:
            return False

        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return False

        # Create workflow execution record
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            ticket_id=ticket_id,
            status='running',
            context=json.dumps(trigger_data or {})
        )
        db.session.add(execution)
        db.session.commit()

        try:
            # Get first step
            first_step = WorkflowStep.query.filter_by(
                workflow_id=workflow_id,
                step_order=1
            ).first()

            if first_step:
                self._execute_step(execution, first_step, ticket, trigger_data)
            else:
                execution.status = 'completed'
                execution.completed_at = datetime.utcnow()
                db.session.commit()

        except Exception as e:
            execution.status = 'failed'
            execution.error_message = str(e)
            execution.completed_at = datetime.utcnow()
            db.session.commit()
            return False

        return True

    def _execute_step(self, execution, step, ticket, trigger_data):
        """Execute a single workflow step"""
        db = self.get_db()
        config = json.loads(step.config)

        if step.step_type == 'action':
            success = self._execute_action(config, ticket, trigger_data)
        elif step.step_type == 'condition':
            success = self._evaluate_condition(config, ticket, trigger_data)
        else:
            success = True  # Skip unknown step types

        if success:
            # Move to next step
            if step.next_step_id:
                next_step = WorkflowStep.query.get(step.next_step_id)
                if next_step:
                    execution.current_step_id = next_step.id
                    db.session.commit()
                    self._execute_step(execution, next_step, ticket, trigger_data)
                else:
                    # Workflow completed
                    execution.status = 'completed'
                    execution.completed_at = datetime.utcnow()
                    db.session.commit()
            else:
                # Workflow completed
                execution.status = 'completed'
                execution.completed_at = datetime.utcnow()
                db.session.commit()
        else:
            # Condition failed, end workflow
            execution.status = 'completed'
            execution.completed_at = datetime.utcnow()
            db.session.commit()

    def _execute_action(self, config, ticket, trigger_data):
        """Execute an action step"""
        action_type = config.get('action_type')

        if action_type == 'assign_ticket':
            return self._action_assign_ticket(config, ticket)
        elif action_type == 'update_priority':
            return self._action_update_priority(config, ticket)
        elif action_type == 'send_notification':
            return self._action_send_notification(config, ticket)
        elif action_type == 'set_sla':
            return self._action_set_sla(config, ticket)
        elif action_type == 'escalate_ticket':
            return self._action_escalate_ticket(config, ticket)
        elif action_type == 'auto_close':
            return self._action_auto_close(config, ticket)

        return True

    def _evaluate_condition(self, config, ticket, trigger_data):
        """Evaluate a condition step"""
        condition_type = config.get('condition_type')

        if condition_type == 'priority_check':
            return self._condition_priority_check(config, ticket)
        elif condition_type == 'time_elapsed':
            return self._condition_time_elapsed(config, ticket)
        elif condition_type == 'status_check':
            return self._condition_status_check(config, ticket)
        elif condition_type == 'department_check':
            return self._condition_department_check(config, ticket)

        return True

    # Action implementations
    def _action_assign_ticket(self, config, ticket):
        """Auto-assign ticket based on rules"""
        db = self.get_db()
        assignment_rule = config.get('assignment_rule', 'auto')

        if assignment_rule == 'auto':
            # Use existing auto-assignment logic
            from routes.admin_routes import auto_assign_ticket
            # This would need to be refactored to work here
            pass
        elif assignment_rule == 'specific_user':
            user_id = config.get('user_id')
            if user_id:
                ticket.assigned_to = user_id
                ticket.status = 'in_progress'
                db.session.commit()
                return True

        return False

    def _action_update_priority(self, config, ticket):
        """Update ticket priority"""
        db = self.get_db()
        new_priority = config.get('priority')
        if new_priority in ['low', 'medium', 'high', 'critical']:
            ticket.priority = new_priority
            db.session.commit()
            return True
        return False

    def _action_send_notification(self, config, ticket):
        """Send notification"""
        db = self.get_db()
        notification = Notification(
            user_id=config.get('user_id') or ticket.assigned_to,
            title=config.get('title', 'Workflow Notification'),
            message=config.get('message', 'Ticket workflow action completed'),
            type=config.get('notification_type', 'info'),
            related_ticket_id=ticket.id
        )
        db.session.add(notification)
        db.session.commit()
        return True

    def _action_set_sla(self, config, ticket):
        """Set SLA for ticket"""
        # This would set SLA tracking - implementation depends on SLA model
        return True

    def _action_escalate_ticket(self, config, ticket):
        """Escalate ticket"""
        db = self.get_db()
        ticket.priority = 'critical'
        # Could also reassign to manager, etc.
        db.session.commit()
        return True

    def _action_auto_close(self, config, ticket):
        """Auto-close ticket"""
        db = self.get_db()
        ticket.status = 'closed'
        ticket.resolved_at = datetime.utcnow()
        db.session.commit()
        return True

    # Condition implementations
    def _condition_priority_check(self, config, ticket):
        """Check ticket priority"""
        expected_priority = config.get('priority')
        operator = config.get('operator', 'equals')

        if operator == 'equals':
            return ticket.priority == expected_priority
        elif operator == 'not_equals':
            return ticket.priority != expected_priority
        elif operator == 'greater_than':
            priorities = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
            return priorities.get(ticket.priority, 0) > priorities.get(expected_priority, 0)

        return False

    def _condition_time_elapsed(self, config, ticket):
        """Check if time has elapsed since ticket creation"""
        hours = config.get('hours', 0)
        if ticket.created_at:
            elapsed = datetime.utcnow() - ticket.created_at
            return elapsed.total_seconds() > (hours * 3600)
        return False

    def _condition_status_check(self, config, ticket):
        """Check ticket status"""
        expected_status = config.get('status')
        return ticket.status == expected_status

    def _condition_department_check(self, config, ticket):
        """Check ticket department"""
        expected_department_id = config.get('department_id')
        return ticket.department_id == expected_department_id

    def trigger_workflows(self, trigger_type, ticket_id, trigger_data=None):
        """Trigger workflows based on events"""
        db = self.get_db()
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return

        # Find workflows that match this trigger
        workflows = Workflow.query.filter_by(is_active=True).all()

        for workflow in workflows:
            steps = WorkflowStep.query.filter_by(
                workflow_id=workflow.id,
                step_type='trigger'
            ).all()

            for step in steps:
                config = json.loads(step.config)
                if config.get('trigger_type') == trigger_type:
                    # Check trigger conditions
                    if self._check_trigger_conditions(config, ticket, trigger_data):
                        self.execute_workflow(workflow.id, ticket_id, trigger_data)

    def _check_trigger_conditions(self, config, ticket, trigger_data):
        """Check if trigger conditions are met"""
        conditions = config.get('conditions', [])

        for condition in conditions:
            condition_type = condition.get('type')
            if condition_type == 'category_match':
                if ticket.category != condition.get('value'):
                    return False
            elif condition_type == 'priority_match':
                if ticket.priority != condition.get('value'):
                    return False
            elif condition_type == 'department_match':
                if ticket.department_id != condition.get('value'):
                    return False

        return True

# Global workflow engine instance
workflow_engine = WorkflowEngine()