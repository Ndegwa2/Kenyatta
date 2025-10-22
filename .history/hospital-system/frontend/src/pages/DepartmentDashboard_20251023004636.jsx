import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { api } from '../services/api';

export default function DepartmentDashboard() {
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [showCreateForm, setShowCreateForm] = useState(false);
   const [templates, setTemplates] = useState([]);
   const [stats, setStats] = useState({
     totalRequests: 0,
     openRequests: 0,
     criticalRequests: 0,
     avgResponseTime: 0
   });
   const [newTicket, setNewTicket] = useState({
     title: '',
     description: '',
     category: 'general',
     priority: 'medium',
     location_details: '',
     equipment_id: '',
     patient_impact: 'none',
     patients_affected: 1,
     time_sensitivity: 'within_shift'
   });

  useEffect(() => {
    fetchData();
    fetchTemplates();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch department tickets (nurses only see their own submissions)
      const ticketsData = await api.get('/department/tickets');
      setTickets(ticketsData);

      // Calculate stats for nurse dashboard
      const totalRequests = ticketsData.length;
      const openRequests = ticketsData.filter(t => t.status === 'open').length;
      const criticalRequests = ticketsData.filter(t => t.priority === 'critical').length;

      setStats({
        totalRequests,
        openRequests,
        criticalRequests,
        avgResponseTime: 0 // TODO: Calculate from ticket data
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tickets');
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const templatesData = await api.get('/department/ticket-templates');
      setTemplates(templatesData);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await api.put(`/department/ticket/${ticketId}/status`, { status });
      // Refresh data
      fetchData();
    } catch (err) {
      setError('Failed to update ticket status');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      patient_impact: ''
    });
    fetchData();
  };

  const createTicket = async () => {
    try {
      await api.post('/department/ticket/create', newTicket);
      setShowCreateForm(false);
      setNewTicket({
        title: '',
        description: '',
        category: 'general',
        priority: 'medium',
        location_details: '',
        equipment_id: '',
        patient_impact: 'none',
        patients_affected: 1,
        time_sensitivity: 'within_shift'
      });
      fetchData();
    } catch (err) {
      setError('Failed to create ticket');
    }
  };

  const loadTemplate = (template) => {
    setNewTicket({
      title: template.title,
      description: template.description,
      category: template.category,
      priority: template.priority,
      location_details: '',
      equipment_id: '',
      patient_impact: template.patient_impact,
      patients_affected: 1,
      time_sensitivity: template.time_sensitivity
    });
    setShowCreateForm(true);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <Sidebar role="department" />
          <main>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading dashboard...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <Sidebar role="department" />
          <main>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Sidebar role="department" />
        <main>
          <div className="main-header">
            <h2>Nursing Department Dashboard</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create Maintenance Request'}
            </button>
          </div>

          {/* Filters */}
          <Card className="mb-4">
            <h4>Filter Tickets</h4>
            <div className="grid grid-cols-4 gap-4 mt-3">
              <select
                className="form-control"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
              <select
                className="form-control"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                className="form-control"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="medical_equipment">Medical Equipment</option>
                <option value="hygiene_facilities">Hygiene Facilities</option>
                <option value="patient_room_facilities">Patient Room Facilities</option>
                <option value="emergency_equipment">Emergency Equipment</option>
                <option value="general">General</option>
              </select>
              <select
                className="form-control"
                value={filters.patient_impact}
                onChange={(e) => handleFilterChange('patient_impact', e.target.value)}
              >
                <option value="">All Impact Levels</option>
                <option value="none">None</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn btn-secondary" onClick={applyFilters}>Apply Filters</button>
              <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          </Card>

          {/* Create Ticket Form */}
          {showCreateForm && (
            <Card className="mb-4">
              <h4>Create Maintenance Request</h4>

              {/* Quick Templates */}
              <div className="mb-4">
                <h5>Quick Templates:</h5>
                <div className="flex flex-wrap gap-2">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      className="btn btn-outline btn-sm"
                      onClick={() => loadTemplate(template)}
                    >
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  >
                    <option value="general">General</option>
                    <option value="medical_equipment">Medical Equipment</option>
                    <option value="hygiene_facilities">Hygiene Facilities</option>
                    <option value="patient_room_facilities">Patient Room Facilities</option>
                    <option value="emergency_equipment">Emergency Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Location Details</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Room 205, ICU Ward A"
                    value={newTicket.location_details}
                    onChange={(e) => setNewTicket({...newTicket, location_details: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Equipment ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Serial number or equipment identifier"
                    value={newTicket.equipment_id}
                    onChange={(e) => setNewTicket({...newTicket, equipment_id: e.target.value})}
                  />
                </div>
                <div>
                  <label className="form-label">Patient Impact</label>
                  <select
                    className="form-control"
                    value={newTicket.patient_impact}
                    onChange={(e) => setNewTicket({...newTicket, patient_impact: e.target.value})}
                  >
                    <option value="none">None</option>
                    <option value="minor">Minor</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Time Sensitivity</label>
                  <select
                    className="form-control"
                    value={newTicket.time_sensitivity}
                    onChange={(e) => setNewTicket({...newTicket, time_sensitivity: e.target.value})}
                  >
                    <option value="within_shift">Within Shift</option>
                    <option value="within_hour">Within Hour</option>
                    <option value="within_day">Within Day</option>
                    <option value="immediate">Immediate</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2 mt-4">
                <button className="btn btn-primary" onClick={createTicket}>Create Request</button>
                <button className="btn btn-outline" onClick={() => setShowCreateForm(false)}>Cancel</button>
              </div>
            </Card>
          )}

          <h3 className="mb-4">Maintenance Requests</h3>
          {tickets.length === 0 ? (
            <Card>
              <p className="text-center text-secondary">No maintenance requests found.</p>
            </Card>
          ) : (
            tickets.map(ticket => (
              <Card key={ticket.id} className="mb-4">
                <div className="card__header">
                  <h4 className="card__title">{ticket.title}</h4>
                  <div className="flex gap-2">
                    <span className={`status-badge status-${ticket.status}`}>{ticket.status}</span>
                    <span className={`status-badge priority-${ticket.priority}`}>{ticket.priority}</span>
                    <span className={`status-badge category-${ticket.category}`}>{ticket.category ? ticket.category.replace('_', ' ') : 'General'}</span>
                  </div>
                </div>
                <p className="mb-4">{ticket.description}</p>

                {/* Enhanced ticket info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {ticket.location_details && (
                    <div>
                      <strong>Location:</strong> {ticket.location_details}
                    </div>
                  )}
                  {ticket.equipment_id && (
                    <div>
                      <strong>Equipment ID:</strong> {ticket.equipment_id}
                    </div>
                  )}
                  <div>
                    <strong>Patient Impact:</strong>
                    <span className={`status-badge impact-${ticket.patient_impact} ml-2`}>
                      {ticket.patient_impact}
                    </span>
                  </div>
                  <div>
                    <strong>Time Sensitivity:</strong> {ticket.time_sensitivity ? ticket.time_sensitivity.replace('_', ' ') : 'Not specified'}
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <small className="text-muted">
                    Created: {new Date(ticket.created_at).toLocaleString()}
                  </small>
                  <small className="text-muted">Patient ID: {ticket.patient_id}</small>
                </div>

                <div className="flex gap-2">
                  {ticket.status === 'open' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                    >
                      Mark In Progress
                    </button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <button
                      className="btn btn-success"
                      onClick={() => updateTicketStatus(ticket.id, 'closed')}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {ticket.status === 'closed' && (
                    <span className="status-badge status-closed">Resolved</span>
                  )}
                </div>
              </Card>
            ))
          )}
        </main>
      </div>
    </div>
  );
}