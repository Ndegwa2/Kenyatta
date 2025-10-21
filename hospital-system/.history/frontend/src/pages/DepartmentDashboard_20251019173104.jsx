import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

export default function DepartmentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch department tickets
      const ticketsData = await api.get('/department/tickets');
      setTickets(ticketsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch tickets');
      setLoading(false);
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
          <h2>Department Dashboard</h2>
          
          <h3>Department Tickets</h3>
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
                  <small>Patient ID: {ticket.patient_id}</small>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  {ticket.status === 'open' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Mark In Progress
                    </button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => updateTicketStatus(ticket.id, 'closed')}
                    >
                      Mark Resolved
                    </button>
                  )}
                  {ticket.status === 'closed' && (
                    <span className="status-closed">Resolved</span>
                  )}
                </div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
}