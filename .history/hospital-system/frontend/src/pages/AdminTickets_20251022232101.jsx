import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import TicketCard from '../components/TicketCard';
import TicketDetails from '../components/TicketDetails';
import TicketTemplateSelector from '../components/TicketTemplateSelector';
import WorkflowBuilder from '../components/WorkflowBuilder';

export default function AdminTickets() {
   const navigate = useNavigate();
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedTicketId, setSelectedTicketId] = useState(null);
   const [filter, setFilter] = useState('all'); // all, pending, assigned, resolved
   const [showTemplateSelector, setShowTemplateSelector] = useState(false);
   const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false);
   const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let endpoint = '/admin/tickets';
      if (filter !== 'all') {
        endpoint += `?status=${filter}`;
      }
      const ticketsData = await api.get(endpoint);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to fetch tickets');
      setTickets([]);
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const statusMap = {
        'assigned': 'in_progress',
        'resolved': 'closed'
      };
      const backendStatus = statusMap[status] || status;

      await api.put(`/admin/ticket/${ticketId}/status`, { status: backendStatus });
      fetchTickets(); // Refresh data
    } catch (err) {
      setError('Failed to update ticket status');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading tickets...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#e74c3c'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ margin: '18px', background: '#f4f6fb', minHeight: '100vh' }}>
      <h2 style={{ marginLeft: '230px' }}>Admin - Tickets Management</h2>

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '200px',
          height: '100vh',
          background: '#1e293b',
          padding: '20px 0'
        }}
      >
        <div style={{ padding: '0 32px 20px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
          SOLU-HMS
        </div>

        <nav style={{ padding: '0 32px' }}>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => navigate('/admin')}
          >
            🏠 Dashboard
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '4px'
            }}
            onClick={() => navigate('/admin/tickets')}
          >
            🎟 Tickets
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => navigate('/admin/casuals')}
          >
            👷 Casuals
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => navigate('/admin/reports')}
          >
            📊 Reports
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => navigate('/admin/settings')}
          >
            ⚙ Settings
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: 'transparent',
              borderRadius: '4px',
              marginTop: '20px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: '20px'
            }}
            onClick={handleLogout}
          >
            🚪 Logout
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '230px', maxWidth: '870px' }}>
        {/* Header */}
         <div
           style={{
             width: '100%',
             height: '64px',
             borderRadius: '10px',
             background: '#ffffff',
             border: '1px solid #e6eefb',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'space-between',
             padding: '0 24px',
             marginBottom: '30px'
           }}
         >
           <h1 style={{ fontSize: '22px', color: '#0f172a', fontWeight: 700, margin: 0 }}>
             Tickets Management
           </h1>
           <div style={{ display: 'flex', gap: '10px' }}>
             <button
               onClick={() => setShowTemplateSelector(true)}
               style={{
                 padding: '8px 16px',
                 backgroundColor: '#28a745',
                 color: 'white',
                 border: 'none',
                 borderRadius: '4px',
                 cursor: 'pointer'
               }}
             >
               📋 Create from Template
             </button>
             <button
               onClick={() => setShowWorkflowBuilder(true)}
               style={{
                 padding: '8px 16px',
                 backgroundColor: '#17a2b8',
                 color: 'white',
                 border: 'none',
                 borderRadius: '4px',
                 cursor: 'pointer'
               }}
             >
               ⚙ Manage Workflows
             </button>
           </div>
         </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: filter === 'all' ? '#3b82f6' : '#e5e7eb',
              color: filter === 'all' ? '#ffffff' : '#374151',
              cursor: 'pointer'
            }}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: filter === 'pending' ? '#3b82f6' : '#e5e7eb',
              color: filter === 'pending' ? '#ffffff' : '#374151',
              cursor: 'pointer'
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('assigned')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: filter === 'assigned' ? '#3b82f6' : '#e5e7eb',
              color: filter === 'assigned' ? '#ffffff' : '#374151',
              cursor: 'pointer'
            }}
          >
            Assigned
          </button>
          <button
            onClick={() => setFilter('resolved')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: filter === 'resolved' ? '#3b82f6' : '#e5e7eb',
              color: filter === 'resolved' ? '#ffffff' : '#374151',
              cursor: 'pointer'
            }}
          >
            Resolved
          </button>
        </div>

        {/* Tickets */}
        <div>
          {tickets.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
              background: '#fff',
              borderRadius: '8px'
            }}>
              No tickets found
            </div>
          ) : (
            tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onClick={(ticketId) => setSelectedTicketId(ticketId)}
              />
            ))
          )}
        </div>

        {/* Ticket Details Modal */}
        {selectedTicketId && (
          <TicketDetails
            ticketId={selectedTicketId}
            onClose={() => {
              setSelectedTicketId(null);
              fetchTickets(); // Refresh data when modal closes
            }}
          />
        )}
      </div>
    </div>
  );
}