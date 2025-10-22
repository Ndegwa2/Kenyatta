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

          {/* HOME VIEW */}
          {currentView === 'home' && (
            <>
              <div className="nursing-welcome-panel">
                <h2 className="nursing-form-title">🏥 Nursing Department Dashboard</h2>
                <p style={{ marginBottom: '20px', color: '#64748b' }}>
                  Welcome back, HOD Wanjiru. Here's your department overview.
                </p>
                
                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af' }}>12</div>
                    <div style={{ fontSize: '14px', color: '#1e40af' }}>Active Requests</div>
                  </div>
                  <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#92400e' }}>5</div>
                    <div style={{ fontSize: '14px', color: '#92400e' }}>Pending Approval</div>
                  </div>
                  <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>28</div>
                    <div style={{ fontSize: '14px', color: '#166534' }}>Completed This Week</div>
                  </div>
                  <div style={{ background: '#fce7f3', padding: '20px', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#be185d' }}>3</div>
                    <div style={{ fontSize: '14px', color: '#be185d' }}>Urgent Issues</div>
                  </div>
                </div>

                {/* Recent Activity */}
                <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>Recent Activity</h3>
                <div style={{ background: 'white', borderRadius: '8px', padding: '20px', border: '1px solid #e2e8f0' }}>
                  {[
                    { time: '10 mins ago', action: 'Request #1248 assigned to Electrician Mwangi', status: 'info' },
                    { time: '1 hour ago', action: 'Request #1245 completed - Leaking tap fixed', status: 'success' },
                    { time: '2 hours ago', action: 'New urgent request submitted for ICU', status: 'warning' },
                    { time: '3 hours ago', action: 'Request #1241 in progress - Kitchen conveyor repair', status: 'info' }
                  ].map((activity, idx) => (
                    <div key={idx} style={{ padding: '12px 0', borderBottom: idx < 3 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', color: '#0f172a' }}>{activity.action}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{activity.time}</div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        background: activity.status === 'success' ? '#dcfce7' : activity.status === 'warning' ? '#fef3c7' : '#dbeafe',
                        color: activity.status === 'success' ? '#166534' : activity.status === 'warning' ? '#92400e' : '#1e40af'
                      }}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* RAISE REQUEST VIEW */}
          {currentView === 'raise-request' && (
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
          )}

          {/* TRACK REQUESTS VIEW */}
          {currentView === 'track-requests' && (
            <div className="nursing-form-panel">
              <h2 className="nursing-form-title">📋 Track Maintenance Requests</h2>
              
              {/* Filter Options */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #3b82f6', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>All</button>
                <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}>Pending</button>
                <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}>Assigned</button>
                <button style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer' }}>Completed</button>
              </div>

              {/* Requests Table */}
              <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Request ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Area</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Issue</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 1248, category: 'Electrical', area: 'Ward 3A', issue: 'Sparking outlet near bed 4', status: 'Assigned', date: '2025-10-22' },
                      { id: 1247, category: 'Plumbing', area: 'ICU', issue: 'Water pressure low in sink', status: 'Pending', date: '2025-10-22' },
                      { id: 1245, category: 'Plumbing', area: 'Ward 2B', issue: 'Leaking tap in nurses station', status: 'Completed', date: '2025-10-21' },
                      { id: 1244, category: 'Sanitation', area: 'Ward 1A', issue: 'Blocked drain in bathroom', status: 'Assigned', date: '2025-10-21' },
                      { id: 1241, category: 'Mechanical', area: 'Kitchen', issue: 'Broken food conveyor belt', status: 'In Progress', date: '2025-10-20' },
                      { id: 1238, category: 'Electrical', area: 'Maternity', issue: 'Flickering lights in delivery room', status: 'Completed', date: '2025-10-20' },
                      { id: 1235, category: 'HVAC', area: 'Operating Theatre', issue: 'AC not cooling properly', status: 'Completed', date: '2025-10-19' },
                      { id: 1232, category: 'Electrical', area: 'Emergency', issue: 'Backup generator test required', status: 'Pending', date: '2025-10-19' }
                    ].map((request, idx) => (
                      <tr key={request.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>#{request.id}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{request.category}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{request.area}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{request.issue}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: request.status === 'Completed' ? '#dcfce7' : request.status === 'Pending' ? '#fef3c7' : request.status === 'Assigned' ? '#dbeafe' : '#e0e7ff',
                            color: request.status === 'Completed' ? '#166534' : request.status === 'Pending' ? '#92400e' : request.status === 'Assigned' ? '#1e40af' : '#4338ca'
                          }}>
                            {request.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{request.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MESSAGES VIEW */}
          {currentView === 'messages' && (
            <div className="nursing-form-panel">
              <h2 className="nursing-form-title">💬 Messages & Communications</h2>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  { id: 1, from: 'Maintenance Admin', subject: 'Request #1248 Update', message: 'Technician Mwangi has been assigned to your electrical issue in Ward 3A. ETA: 14:00 today.', time: '10 mins ago', unread: true },
                  { id: 2, from: 'Electrician Mwangi', subject: 'Re: Ward 3A Outlet', message: 'I have inspected the outlet. Will need to replace the socket. Parts ordered, will complete tomorrow morning.', time: '2 hours ago', unread: true },
                  { id: 3, from: 'Maintenance Admin', subject: 'Request #1245 Completed', message: 'The leaking tap in Ward 2B has been fixed. Please verify and close the ticket if satisfied.', time: '1 day ago', unread: false },
                  { id: 4, from: 'Plumber Ochieng', subject: 'ICU Water Pressure', message: 'Investigating the low water pressure issue. May need to check main supply line. Will update by EOD.', time: '1 day ago', unread: false },
                  { id: 5, from: 'System', subject: 'Weekly Maintenance Report', message: 'Your department submitted 8 requests this week. 6 completed, 2 in progress. Average resolution time: 18 hours.', time: '2 days ago', unread: false }
                ].map((msg) => (
                  <div key={msg.id} style={{
                    background: msg.unread ? '#eff6ff' : 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    border: `1px solid ${msg.unread ? '#93c5fd' : '#e2e8f0'}`,
                    cursor: 'pointer'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                          {msg.from}
                          {msg.unread && <span style={{ marginLeft: '8px', padding: '2px 8px', background: '#3b82f6', color: 'white', borderRadius: '10px', fontSize: '11px' }}>New</span>}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '500', color: '#475569' }}>{msg.subject}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>{msg.time}</div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{msg.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORTS VIEW */}
          {currentView === 'reports' && (
            <div className="nursing-form-panel">
              <h2 className="nursing-form-title">📊 Department Reports & Analytics</h2>
              
              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Total Requests (This Month)</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>47</div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>↑ 12% from last month</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Avg Resolution Time</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>18h</div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>↓ 3h improvement</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Completion Rate</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a' }}>94%</div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '8px' }}>↑ 2% increase</div>
                </div>
              </div>

              {/* Category Breakdown */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Requests by Category</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {[
                    { category: 'Electrical', count: 18, percentage: 38, color: '#3b82f6' },
                    { category: 'Plumbing', count: 15, percentage: 32, color: '#06b6d4' },
                    { category: 'Mechanical', count: 9, percentage: 19, color: '#8b5cf6' },
                    { category: 'Sanitation', count: 5, percentage: 11, color: '#10b981' }
                  ].map((item) => (
                    <div key={item.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#475569' }}>{item.category}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{item.count} requests</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.percentage}%`, height: '100%', background: item.color, transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Trends */}
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Weekly Trends</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const values = [8, 12, 7, 15, 10, 4, 3];
                    return (
                      <div key={day}>
                        <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                          <div style={{
                            width: '40px',
                            height: `${values[idx] * 6}px`,
                            background: '#3b82f6',
                            borderRadius: '4px 4px 0 0',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingTop: '4px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {values[idx]}
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW */}
          {currentView === 'settings' && (
            <div className="nursing-form-panel">
              <h2 className="nursing-form-title">⚙ Department Settings</h2>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                {/* Notification Preferences */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Notification Preferences</h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      { label: 'Email notifications for new assignments', checked: true },
                      { label: 'SMS alerts for urgent requests', checked: true },
                      { label: 'Daily summary reports', checked: false },
                      { label: 'Completion notifications', checked: true }
                    ].map((pref, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked={pref.checked} style={{ width: '18px', height: '18px' }} />
                        <span style={{ fontSize: '14px', color: '#475569' }}>{pref.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Department Information */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Department Information</h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>Department Name</label>
                      <input type="text" defaultValue="Nursing Department" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>HOD Name</label>
                      <input type="text" defaultValue="Wanjiru Kamau" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>Contact Email</label>
                      <input type="email" defaultValue="wanjiru.kamau@knh.go.ke" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', color: '#64748b', marginBottom: '6px' }}>Contact Phone</label>
                      <input type="tel" defaultValue="+254 712 345 678" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Quick Actions</h3>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <button style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
                      📥 Export Monthly Report
                    </button>
                    <button style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
                      🔄 Sync with Maintenance System
                    </button>
                    <button style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: '#475569' }}>
                      📋 View Maintenance Schedule
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                  Save Settings
                </button>
              </div>
            </div>
          )}
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