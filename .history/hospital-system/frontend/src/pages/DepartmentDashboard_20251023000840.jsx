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
   const [filters, setFilters] = useState({
     status: '',
     priority: '',
     category: '',
     patient_impact: ''
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
          <div className="main-header">
            <h2>Department Dashboard</h2>
          </div>
          
          <h3 className="mb-4">Department Tickets</h3>
          {tickets.length === 0 ? (
            <Card>
              <p className="text-center text-secondary">No tickets found.</p>
            </Card>
          ) : (
            tickets.map(ticket => (
              <Card key={ticket.id} className="mb-4">
                <div className="card__header">
                  <h4 className="card__title">{ticket.title}</h4>
                </div>
                <p className="mb-4">{ticket.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className={`status-badge status-${ticket.status}`}>{ticket.status}</span>
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