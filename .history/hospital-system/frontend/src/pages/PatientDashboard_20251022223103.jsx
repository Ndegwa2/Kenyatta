import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PatientProfile from '../components/PatientProfile';
import AppointmentScheduler from '../components/AppointmentScheduler';
import AppointmentList from '../components/AppointmentList';
import TicketCard from '../components/TicketCard';
import TicketDetails from '../components/TicketDetails';
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
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
            <div>
              {showCreateForm && (
                <Card className="mb-6">
                  <div className="card__header">
                    <h3 className="card__title">Create New Ticket</h3>
                  </div>
                  <form onSubmit={handleCreateTicket}>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Department ID</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newTicket.department_id}
                        onChange={(e) => setNewTicket({...newTicket, department_id: e.target.value})}
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
                    <button type="submit" className="btn btn-primary">Submit Ticket</button>
                  </form>
                </Card>
              )}

              <h3 className="mb-4">My Tickets</h3>
               {tickets.length === 0 ? (
                 <Card>
                   <p className="text-center text-secondary">No tickets found.</p>
                 </Card>
               ) : (
                 <div className="tickets-grid">
                   {tickets.map(ticket => (
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
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;