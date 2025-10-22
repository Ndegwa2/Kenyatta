import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './TicketDetails.css';

const TicketDetails = ({ ticketId, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchTicketDetails();
    fetchTechnicians();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      const data = await api.get(`/ticket/${ticketId}`);
      setTicket(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await api.get('/admin/technicians');
      setTechnicians(data);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/ticket/${ticketId}/comment`, { comment: newComment });
      setNewComment('');
      fetchTicketDetails(); // Refresh to show new comment
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`http://localhost:5000/ticket/${ticketId}/attachment`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSelectedFile(null);
        fetchTicketDetails(); // Refresh to show new attachment
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/ticket/${ticketId}/status`, { status: newStatus });
      fetchTicketDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await api.put(`/ticket/${ticketId}/priority`, { priority: newPriority });
      fetchTicketDetails();
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    }
  };

  const handleAssignmentChange = async (technicianUserId) => {
    setAssigning(true);
    try {
      await api.put(`/ticket/${ticketId}/assign`, { user_id: technicianUserId });
      fetchTicketDetails();
    } catch (error) {
      console.error('Error assigning ticket:', error);
      alert('Failed to assign ticket');
    } finally {
      setAssigning(false);
    }
  };

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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="ticket-details-overlay">
        <div className="ticket-details-modal">
          <div className="loading">Loading ticket details...</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-details-overlay">
        <div className="ticket-details-modal">
          <div className="error">Ticket not found</div>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-details-overlay" onClick={onClose}>
      <div className="ticket-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ticket Details</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          {/* Ticket Information */}
          <div className="ticket-info-section">
            <div className="info-row">
              <span className="label">ID:</span>
              <span className="value">#{ticket.id}</span>
            </div>
            <div className="info-row">
              <span className="label">Title:</span>
              <span className="value">{ticket.title}</span>
            </div>
            <div className="info-row">
              <span className="label">Description:</span>
              <span className="value">{ticket.description}</span>
            </div>
            <div className="info-row">
              <span className="label">Patient:</span>
              <span className="value">{ticket.patient}</span>
            </div>
            <div className="info-row">
              <span className="label">Department:</span>
              <span className="value">{ticket.department}</span>
            </div>
            <div className="info-row">
              <span className="label">Assigned To:</span>
              <span className="value">{ticket.assigned_to || 'Unassigned'}</span>
            </div>
            <div className="info-row">
              <span className="label">Category:</span>
              <span className="value badge badge-info">{ticket.category}</span>
            </div>
            <div className="info-row">
              <span className="label">Created:</span>
              <span className="value">{formatDate(ticket.created_at)}</span>
            </div>
            <div className="info-row">
              <span className="label">Updated:</span>
              <span className="value">{formatDate(ticket.updated_at)}</span>
            </div>
            {ticket.resolved_at && (
              <div className="info-row">
                <span className="label">Resolved:</span>
                <span className="value">{formatDate(ticket.resolved_at)}</span>
              </div>
            )}
          </div>

          {/* Status and Priority Controls */}
          <div className="controls-section">
            <div className="control-group">
              <label>Status:</label>
              <div className="status-buttons">
                <button
                  className={`status-btn ${ticket.status === 'open' ? 'active' : ''}`}
                  style={{ backgroundColor: ticket.status === 'open' ? getStatusColor('open') : '#e9ecef' }}
                  onClick={() => handleStatusChange('open')}
                >
                  Open
                </button>
                <button
                  className={`status-btn ${ticket.status === 'in_progress' ? 'active' : ''}`}
                  style={{ backgroundColor: ticket.status === 'in_progress' ? getStatusColor('in_progress') : '#e9ecef' }}
                  onClick={() => handleStatusChange('in_progress')}
                >
                  In Progress
                </button>
                <button
                  className={`status-btn ${ticket.status === 'closed' ? 'active' : ''}`}
                  style={{ backgroundColor: ticket.status === 'closed' ? getStatusColor('closed') : '#e9ecef' }}
                  onClick={() => handleStatusChange('closed')}
                >
                  Closed
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Priority:</label>
              <div className="priority-buttons">
                <button
                  className={`priority-btn ${ticket.priority === 'low' ? 'active' : ''}`}
                  style={{ backgroundColor: ticket.priority === 'low' ? getPriorityColor('low') : '#e9ecef' }}
                  onClick={() => handlePriorityChange('low')}
                >
                  Low
                </button>
                <button
                  className={`priority-btn ${ticket.priority === 'medium' ? 'active' : ''}`}
                  style={{ backgroundColor: ticket.priority === 'medium' ? getPriorityColor('medium') : '#e9ecef' }}
                  onClick={() => handlePriorityChange('medium')}
                >
                  Medium
                </button>
                <button
                  className={`priority-btn ${ticket.priority === 'high' ? 'active' : ''}`}
                  style={{ backgroundColor: ticket.priority === 'high' ? getPriorityColor('high') : '#e9ecef' }}
                  onClick={() => handlePriorityChange('high')}
                >
                  High
                </button>
                <button
                  className={`priority-btn ${ticket.priority === 'critical' ? 'active' : ''}`}
                  style={{ backgroundColor: ticket.priority === 'critical' ? getPriorityColor('critical') : '#e9ecef' }}
                  onClick={() => handlePriorityChange('critical')}
                >
                  Critical
                </button>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="comments-section">
            <h3>Comments ({ticket.comments.length})</h3>
            <div className="comments-list">
              {ticket.comments.length === 0 ? (
                <p className="no-comments">No comments yet</p>
              ) : (
                ticket.comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <strong>{comment.user}</strong>
                      <span className="comment-date">{formatDate(comment.created_at)}</span>
                    </div>
                    <div className="comment-body">{comment.comment}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
              <button type="submit" className="btn btn-primary">Add Comment</button>
            </form>
          </div>

          {/* Attachments Section */}
          <div className="attachments-section">
            <h3>Attachments ({ticket.attachments.length})</h3>
            <div className="attachments-list">
              {ticket.attachments.length === 0 ? (
                <p className="no-attachments">No attachments</p>
              ) : (
                ticket.attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment">
                    <div className="attachment-icon">📎</div>
                    <div className="attachment-info">
                      <div className="attachment-name">{attachment.filename}</div>
                      <div className="attachment-meta">
                        {formatFileSize(attachment.file_size)} • {attachment.file_type} • 
                        Uploaded by {attachment.uploaded_by} on {formatDate(attachment.uploaded_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="upload-form">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.txt"
              />
              {selectedFile && (
                <div className="selected-file">
                  <span>{selectedFile.name} ({formatFileSize(selectedFile.size)})</span>
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="btn btn-primary btn-sm"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;