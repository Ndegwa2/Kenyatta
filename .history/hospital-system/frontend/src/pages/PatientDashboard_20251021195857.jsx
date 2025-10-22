import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PatientProfile from '../components/PatientProfile';
import AppointmentScheduler from '../components/AppointmentScheduler';
import AppointmentList from '../components/AppointmentList';
import { api } from '../services/api';

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
      setNewTicket({ title: '', description: '', department_id: '' });
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create ticket');
    }
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Patient Dashboard</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create Ticket'}
            </button>
          </div>
          
          {profile && (
            <PatientProfile
              profile={profile}
              onProfileUpdate={fetchData}
              style={{ marginBottom: '2rem' }}
            />
          )}
          
          {showCreateForm && (
            <div className="ticket-card" style={{ marginBottom: '2rem' }}>
              <h3>Create New Ticket</h3>
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
                <button type="submit" className="btn btn-primary">Submit Ticket</button>
              </form>
            </div>
          )}
          
          <h3>My Tickets</h3>
          {tickets.length === 0 ? (
            <div className="ticket-card">
              <p>No tickets found.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.id} className="ticket-card" style={{ marginBottom: '1rem' }}>
                <h4>{ticket.title}</h4>
                <p>{ticket.description}</p>
                <div className="d-flex justify-between align-center">
                  <span className={`status-${ticket.status}`}>{ticket.status}</span>
                  <small>Ticket ID: {ticket.id}</small>
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;