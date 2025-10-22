import React, { useState, useEffect } from "react";
import './DepartmentDashboard.css';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

export default function DepartmentDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('home');
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    area: '',
    description: '',
    attachment: null
  });

  // Recent requests
  const [recentRequests] = useState([
    { id: 1248, category: 'Electrical', area: 'Ward 3A', issue: 'Sparking outlet', status: 'Pending' },
    { id: 1245, category: 'Plumbing', area: 'Ward 2B', issue: 'Leaking tap', status: 'Completed' },
    { id: 1241, category: 'Mechanical', area: 'Kitchen', issue: 'Broken conveyor', status: 'Assigned' }
  ]);

  // Conversation messages
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Admin', text: 'Technician assigned — ETA 14:00', type: 'admin' },
    { id: 2, sender: 'Nursing HOD', text: 'Acknowledged — please prioritize ICU', type: 'user' },
    { id: 3, sender: 'Admin', text: 'Understood. Technician will confirm on arrival.', type: 'admin' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ticketsData = await api.get('/department/tickets');
      setTickets(ticketsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    // Submit logic here
    alert('Maintenance request submitted successfully!');
    setFormData({ category: '', area: '', description: '', attachment: null });
  };

  const handleSaveDraft = () => {
    alert('Draft saved successfully!');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'Nursing HOD',
        text: newMessage,
        type: 'user'
      }]);
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <div className="nursing-dashboard">
        <div className="nursing-content">
          <aside className="nursing-sidebar">
            <div className="nursing-sidebar-header">
              <h1>KNH — Maintenance</h1>
            </div>
          </aside>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nursing-dashboard">
      {/* Header */}
      <header className="nursing-top-header">
        <h1 className="nursing-top-title">KNH — Maintenance Request Portal</h1>
        <div className="nursing-top-user">
          <span className="nursing-user-role">HOD Nursing • Wanjiru</span>
          <button className="nursing-notification-btn">🔔</button>
        </div>
      </header>

      <div className="nursing-content">
        {/* Left Sidebar */}
        <aside className="nursing-sidebar">
          <div className="nursing-sidebar-header">
            <h2>Navigation</h2>
          </div>
          <nav className="nursing-sidebar-nav">
            <ul>
              <li>
                <button
                  className={currentView === 'home' ? 'active' : ''}
                  onClick={() => setCurrentView('home')}
                >
                  <span>🏠</span>
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'raise-request' ? 'active' : ''}
                  onClick={() => setCurrentView('raise-request')}
                >
                  <span>✉️</span>
                  <span>Raise New Request</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'track-requests' ? 'active' : ''}
                  onClick={() => setCurrentView('track-requests')}
                >
                  <span>📋</span>
                  <span>Track Requests</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'messages' ? 'active' : ''}
                  onClick={() => setCurrentView('messages')}
                >
                  <span>💬</span>
                  <span>Messages</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'reports' ? 'active' : ''}
                  onClick={() => setCurrentView('reports')}
                >
                  <span>📊</span>
                  <span>Reports</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'settings' ? 'active' : ''}
                  onClick={() => setCurrentView('settings')}
                >
                  <span>⚙</span>
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="nursing-main-content">
          {error && (
            <div className="nursing-error-banner">
              {error}
            </div>
          )}

          {/* Maintenance Request Form */}
          <div className="nursing-form-panel">
            <h2 className="nursing-form-title">✉️ Raise Maintenance Request</h2>
            
            <form onSubmit={handleSubmitRequest} className="nursing-request-form">
              <div className="nursing-form-group">
                <label className="nursing-form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="nursing-form-select"
                  required
                >
                  <option value="">Select category — (Electrical / Plumbing / Mechanical / Sanitation)</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="sanitation">Sanitation</option>
                </select>
              </div>

              <div className="nursing-form-group">
                <label className="nursing-form-label">Area / Equipment</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleFormChange}
                  className="nursing-form-input"
                  placeholder="e.g., Ward 3A — Bed outlet #4"
                  required
                />
              </div>

              <div className="nursing-form-group">
                <label className="nursing-form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="nursing-form-textarea"
                  placeholder="Short description of the issue, safety impact, and any immediate action taken."
                  rows="4"
                  required
                />
              </div>

              <div className="nursing-form-group">
                <label className="nursing-form-label">Attachments</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="nursing-form-file"
                  accept="image/*"
                />
                <span className="nursing-file-hint">Upload photo (optional)</span>
              </div>

              <div className="nursing-form-actions">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="nursing-btn nursing-btn-outline"
                >
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="nursing-btn nursing-btn-primary"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>

          {/* Recent Requests */}
          <div className="nursing-recent-panel">
            <h3 className="nursing-recent-title">Recent Requests</h3>
            <div className="nursing-recent-list">
              {recentRequests.map((request) => (
                <div key={request.id} className="nursing-recent-item">
                  <span className="nursing-request-id">#{request.id}</span>
                  <span className="nursing-request-details">
                    {request.category} — {request.area} — {request.issue}
                  </span>
                  <span className={`nursing-status-badge nursing-status-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Conversation */}
        <aside className="nursing-conversation-panel">
          <h3 className="nursing-conversation-title">Maintenance — Conversation</h3>
          
          <div className="nursing-messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`nursing-message nursing-message-${message.type}`}
              >
                <strong>{message.sender}:</strong> {message.text}
              </div>
            ))}
          </div>

          <div className="nursing-message-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="nursing-message-input"
              placeholder="Type a message to Maintenance..."
            />
            <button
              onClick={handleSendMessage}
              className="nursing-send-btn"
            >
              Send
            </button>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="nursing-footer">
        <p>Last sync: {new Date().toLocaleString()} • All messages secured</p>
      </footer>
    </div>
  );
}