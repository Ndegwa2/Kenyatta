from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from models import Notification, User, Ticket
from datetime import datetime

def get_db():
    return current_app.db

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/', methods=['GET'])
@login_required
def get_notifications():
    """Get user's notifications"""
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    notifications = Notification.query.filter_by(user_id=current_user.id)\
        .order_by(Notification.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'notifications': [{
            'id': n.id,
            'title': n.title,
            'message': n.message,
            'type': n.type,
            'related_ticket_id': n.related_ticket_id,
            'is_read': n.is_read,
            'created_at': n.created_at.isoformat() if n.created_at else None
        } for n in notifications.items],
        'total': notifications.total,
        'pages': notifications.pages,
        'current_page': page
    }), 200

@notification_bp.route('/<int:notification_id>/read', methods=['PUT'])
@login_required
def mark_as_read(notification_id):
    """Mark notification as read"""
    notification = Notification.query.get(notification_id)
    if not notification or notification.user_id != current_user.id:
        return jsonify({'message': 'Notification not found'}), 404

    notification.is_read = True
    db = get_db()
    db.session.commit()

    return jsonify({'message': 'Notification marked as read'}), 200

@notification_bp.route('/unread/count', methods=['GET'])
@login_required
def get_unread_count():
    """Get count of unread notifications"""
    count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()
    return jsonify({'unread_count': count}), 200

@notification_bp.route('/read-all', methods=['PUT'])
@login_required
def mark_all_as_read():
    """Mark all notifications as read"""
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
    db = get_db()
    db.session.commit()

    return jsonify({'message': 'All notifications marked as read'}), 200

def create_notification(user_id, title, message, notification_type='info', ticket_id=None):
    """Helper function to create notifications"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notification_type,
        related_ticket_id=ticket_id
    )

    db = get_db()
    db.session.add(notification)
    db.session.commit()

    return notification

def notify_ticket_assignment(ticket, assigned_user):
    """Notify technician when ticket is assigned"""
    if assigned_user:
        create_notification(
            user_id=assigned_user.id,
            title=f"New Ticket Assigned: #{ticket.id}",
            message=f"You have been assigned to ticket '{ticket.title}'. Priority: {ticket.priority}",
            notification_type='info',
            ticket_id=ticket.id
        )

def notify_ticket_resolved(ticket, resolver_user):
    """Notify relevant users when ticket is resolved"""
    # Notify the patient
    patient = User.query.get(ticket.patient_id)
    if patient:
        create_notification(
            user_id=patient.id,
            title=f"Ticket Resolved: #{ticket.id}",
            message=f"Your ticket '{ticket.title}' has been resolved.",
            notification_type='success',
            ticket_id=ticket.id
        )

    # Notify the assigned technician (if different from resolver)
    if ticket.assigned_to and ticket.assigned_to != resolver_user.id:
        assigned_user = User.query.get(ticket.assigned_to)
        if assigned_user:
            create_notification(
                user_id=assigned_user.id,
                title=f"Ticket Resolved: #{ticket.id}",
                message=f"Ticket '{ticket.title}' has been marked as resolved.",
                notification_type='success',
                ticket_id=ticket.id
            )

def notify_ticket_comment(ticket, commenter_user, comment_text):
    """Notify relevant users when comment is added"""
    # Notify assigned technician if comment is from patient/admin
    if ticket.assigned_to and ticket.assigned_to != commenter_user.id:
        assigned_user = User.query.get(ticket.assigned_to)
        if assigned_user:
            create_notification(
                user_id=assigned_user.id,
                title=f"New Comment on Ticket #{ticket.id}",
                message=f"New comment on '{ticket.title}': {comment_text[:100]}{'...' if len(comment_text) > 100 else ''}",
                notification_type='info',
                ticket_id=ticket.id
            )

    # Notify patient if comment is from technician/admin
    if commenter_user.role in ['technician', 'admin', 'manager']:
        patient = User.query.get(ticket.patient_id)
        if patient and patient.id != commenter_user.id:
            create_notification(
                user_id=patient.id,
                title=f"Update on Ticket #{ticket.id}",
                message=f"New update on your ticket '{ticket.title}': {comment_text[:100]}{'...' if len(comment_text) > 100 else ''}",
                notification_type='info',
                ticket_id=ticket.id
            )