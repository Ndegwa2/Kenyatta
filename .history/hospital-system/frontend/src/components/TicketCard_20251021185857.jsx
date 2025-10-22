import React from 'react';
import './TicketCard.css';

const TicketCard = ({ ticket, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#28a745';
      case 'in_progress': return '#ffc107';
      case 'closed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="ticket-card" onClick={() => onClick && onClick(ticket.id)}>
      <div className="ticket-card-header">
        <h3>{ticket.title}</h3>
        <div className="ticket-badges">
          <span 
            className="priority-badge" 
            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
          >
            {ticket.priority || 'medium'}
          </span>
          <span 
            className="status-badge" 
            style={{ backgroundColor: getStatusColor(ticket.status) }}
          >
            {ticket.status}
          </span>
        </div>
      </div>
      <p className="ticket-description">{ticket.description}</p>
      <div className="ticket-card-footer">
        <div className="ticket-meta">
          {ticket.category && (
            <span className="category-tag">{ticket.category}</span>
          )}
          {ticket.department && (
            <span className="department-tag">📍 {ticket.department}</span>
          )}
        </div>
        {ticket.created_at && (
          <span className="ticket-date">Created: {formatDate(ticket.created_at)}</span>
        )}
      </div>
      {ticket.assigned_to && (
        <div className="assigned-info">
          👤 Assigned to: {ticket.assigned_to}
        </div>
      )}
    </div>
  );
};

export default TicketCard;