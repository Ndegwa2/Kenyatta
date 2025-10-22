import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PatientProfile from '../components/PatientProfile';
import AppointmentScheduler from '../components/AppointmentScheduler';
import AppointmentList from '../components/AppointmentList';
import TicketCard from '../components/TicketCard';
import TicketDetails from '../components/TicketDetails';
import MedicalRecords from '../components/MedicalRecords';
import Card from '../components/Card';
import { api } from '../services/api';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    department_id: ''
  });
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredTickets, setFilteredTickets] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Filter tickets based on search term and status filter
    let filtered = tickets;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.id && ticket.id.toString().includes(searchTerm))
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      // Fetch patient profile
      const profileData = await api.get('/patient/profile');
      setProfile(profileData);
      
      // Fetch patient tickets
      const ticketsData = await api.get('/patient/tickets');
      setTickets(ticketsData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patient/ticket', newTicket);
      // Reset form and refresh data
      setNewTicket({ title: '', description: '', department_id: '', priority: 'medium', category: 'general' });
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create ticket');
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  const handleCloseTicketDetails = () => {
    setShowTicketDetails(false);
    setSelectedTicket(null);
    fetchData(); // Refresh tickets after potential updates
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <Sidebar role="patient" />
          <main>
            <div className="main-header">
              <h2>Patient Dashboard</h2>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation" style={{ marginBottom: '2rem' }}>
              <button className="tab-button active">Support Tickets</button>
            </div>

            {/* Loading Skeletons */}
            <div className="tickets-section">
              <div className="tickets-header">
                <div className="tickets-header__left">
                  <div className="skeleton skeleton-title"></div>
                  <div className="tickets-stats">
                    <div className="stat-item">
                      <div className="skeleton skeleton-stat-number"></div>
                      <div className="skeleton skeleton-stat-label"></div>
                    </div>
                    <div className="stat-item">
                      <div className="skeleton skeleton-stat-number"></div>
                      <div className="skeleton skeleton-stat-label"></div>
                    </div>
                    <div className="stat-item">
                      <div className="skeleton skeleton-stat-number"></div>
                      <div className="skeleton skeleton-stat-label"></div>
                    </div>
                  </div>
                </div>
                <div className="skeleton skeleton-button"></div>
              </div>

              <div className="tickets-controls">
                <div className="skeleton skeleton-search"></div>
                <div className="filter-buttons">
                  <div className="skeleton skeleton-filter-btn"></div>
                  <div className="skeleton skeleton-filter-btn"></div>
                  <div className="skeleton skeleton-filter-btn"></div>
                  <div className="skeleton skeleton-filter-btn"></div>
                </div>
              </div>

              <div className="tickets-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton skeleton-card-header"></div>
                    <div className="skeleton skeleton-card-content"></div>
                    <div className="skeleton skeleton-card-footer"></div>
                  </div>
                ))}
              </div>
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
          <Sidebar role="patient" />
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
        <Sidebar role="patient" />
        <main>
          <div className="main-header">
            <h2>Patient Dashboard</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create Ticket'}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation" style={{ marginBottom: '2rem' }}>
            <button
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              My Profile
            </button>
            <button
              className={`tab-button ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              Appointments
            </button>
            <button
              className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              Support Tickets
            </button>
            <button
              className={`tab-button ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => setActiveTab('records')}
            >
              Medical Records
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && profile && (
            <PatientProfile
              profile={profile}
              onProfileUpdate={fetchData}
            />
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div>
              <AppointmentScheduler
                patientId={profile?.id}
                onAppointmentCreated={() => {
                  // Could refresh appointment list here if we had one
                }}
              />
              <AppointmentList
                patientId={profile?.id}
                showControls={false}
              />
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="tickets-section">
              {/* Header Section */}
              <div className="tickets-header">
                <div className="tickets-header__left">
                  <h2 className="tickets-title">My Support Tickets</h2>
                  <div className="tickets-stats">
                    <span className="stat-item">
                      <span className="stat-number">{tickets.filter(t => t.status === 'open').length}</span>
                      <span className="stat-label">Open</span>
                    </span>
                    <span className="stat-item">
                      <span className="stat-number">{tickets.filter(t => t.status === 'in_progress').length}</span>
                      <span className="stat-label">In Progress</span>
                    </span>
                    <span className="stat-item">
                      <span className="stat-number">{tickets.filter(t => t.status === 'closed').length}</span>
                      <span className="stat-label">Closed</span>
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-create-ticket"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? 'Cancel' : '+ Create Ticket'}
                </button>
              </div>

              {/* Create Form */}
              {showCreateForm && (
                <Card className="mb-6">
                  <div className="card__header">
                    <h3 className="card__title">Create New Support Ticket</h3>
                  </div>
                  <form onSubmit={handleCreateTicket}>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                        placeholder="Brief description of your issue"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        placeholder="Please provide detailed information about your request"
                        required
                      ></textarea>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Department</label>
                        <input
                          type="number"
                          className="form-control"
                          value={newTicket.department_id}
                          onChange={(e) => setNewTicket({...newTicket, department_id: e.target.value})}
                          placeholder="Department ID"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select
                          className="form-control"
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          className="form-control"
                          value={newTicket.category}
                          onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                        >
                          <option value="general">General</option>
                          <option value="medical">Medical</option>
                          <option value="administrative">Administrative</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">Submit Ticket</button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Search and Filter */}
              <div className="tickets-controls">
                <div className="search-container">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search tickets by title, description, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({tickets.length})
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === 'open' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('open')}
                  >
                    Open ({tickets.filter(t => t.status === 'open').length})
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === 'in_progress' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('in_progress')}
                  >
                    In Progress ({tickets.filter(t => t.status === 'in_progress').length})
                  </button>
                  <button
                    className={`filter-btn ${statusFilter === 'closed' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('closed')}
                  >
                    Closed ({tickets.filter(t => t.status === 'closed').length})
                  </button>
                </div>
              </div>

              {/* Tickets Grid */}
              {filteredTickets.length === 0 ? (
                <Card className="empty-state">
                  <div className="empty-state__content">
                    <div className="empty-state__icon">🎫</div>
                    <h3 className="empty-state__title">
                      {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your search'}
                    </h3>
                    <p className="empty-state__message">
                      {tickets.length === 0
                        ? 'Create your first support ticket to get help with any issues or questions.'
                        : 'Try adjusting your search terms or filter criteria.'
                      }
                    </p>
                    {tickets.length === 0 && (
                      <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateForm(true)}
                      >
                        Create Your First Ticket
                      </button>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="tickets-grid">
                  {filteredTickets.map(ticket => (
                    <TicketCard
                      key={ticket.id}
                      ticket={ticket}
                      onClick={() => handleTicketClick(ticket)}
                    />
                  ))}
                </div>
              )}

              {/* Ticket Details Modal */}
              {showTicketDetails && selectedTicket && (
                <TicketDetails
                  ticket={selectedTicket}
                  onClose={handleCloseTicketDetails}
                  isPatientView={true}
                />
              )}
            </div>
          )}

      {/* Medical Records Tab */}
      {activeTab === 'records' && profile && (
        <MedicalRecords patientId={profile.id} />
      )}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;