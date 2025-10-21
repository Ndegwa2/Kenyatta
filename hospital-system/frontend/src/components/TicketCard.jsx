import React from 'react';
import Card from './Card';
import './TicketCard.css';

const TicketCard = ({ ticket, onClick }) => {
  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'var(--hospital-success)';
      case 'in_progress': return 'var(--hospital-warning)';
      case 'closed': return 'var(--hospital-text-secondary)';
      default: return 'var(--hospital-text-secondary)';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card
      variant={getPriorityVariant(ticket.priority)}
      interactive={!!onClick}
      onClick={() => onClick && onClick(ticket.id)}
      className="ticket-card--enhanced"
    >
      <div className="ticket-card__header">
        <h3 className="ticket-card__title">{ticket.title}</h3>
        <div className="ticket-card__badges">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(ticket.status) }}
          >
            {ticket.status?.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="ticket-card__content">
        <p className="ticket-card__description">{ticket.description}</p>
      </div>

      <div className="ticket-card__footer">
        <div className="ticket-card__meta">
          {ticket.category && (
            <span className="meta-tag meta-tag--category">{ticket.category}</span>
          )}
          {ticket.department && (
            <span className="meta-tag meta-tag--department">🏥 {ticket.department}</span>
          )}
        </div>
        <div className="ticket-card__info">
          {ticket.created_at && (
            <span className="ticket-date">{formatDate(ticket.created_at)}</span>
          )}
          {ticket.assigned_to && (
            <div className="assigned-info">
              👤 {ticket.assigned_to}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TicketCard;