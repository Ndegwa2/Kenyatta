// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { api } from '../services/api';

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    pending: 0,
    assigned: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch tickets
      const ticketsData = await api.get('/admin/tickets');
      // Ensure tickets is always an array
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      
      // Fetch stats
      const statsData = await api.get('/admin/stats');
      setStats({
        pending: statsData.pending || 0,
        assigned: statsData.assigned || 0,
        resolved: statsData.resolved || 0
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setTickets([]); // Ensure tickets is always an array
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      // Map frontend status to backend status
      const statusMap = {
        'assigned': 'in_progress',
        'resolved': 'closed'
      };
      const backendStatus = statusMap[status] || status;
      
      await api.put(`/admin/ticket/${ticketId}/status`, { status: backendStatus });
      // Refresh data
      fetchData();
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
        Loading dashboard...
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
      <h2 style={{ marginLeft: '230px' }}>Admin Dashboard</h2>
      
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
              backgroundColor: active === 'Dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Dashboard')}
          >
            🏠 Dashboard
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: active === 'Tickets' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Tickets')}
          >
            🎟 Tickets
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: active === 'Casuals' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Casuals')}
          >
            👷 Casuals
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: active === 'Reports' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Reports')}
          >
            📊 Reports
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#f1f5f9',
              padding: '10px 0',
              cursor: 'pointer',
              backgroundColor: active === 'Settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '4px'
            }}
            onClick={() => setActive('Settings')}
          >
            ⚙ Settings
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
            padding: '0 24px',
            marginBottom: '30px'
          }}
        >
          <h1 style={{ fontSize: '22px', color: '#0f172a', fontWeight: 700, margin: 0 }}>
            Admin Dashboard
          </h1>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
          <div
            style={{
              width: '180px',
              height: '90px',
              borderRadius: '10px',
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
              Pending Tickets
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#166534' }}>
              {stats.pending}
            </div>
          </div>

          <div
            style={{
              width: '180px',
              height: '90px',
              borderRadius: '10px',
              background: '#fef9c3',
              border: '1px solid #fde68a',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#854d0e', marginBottom: '8px' }}>
              Assigned
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#854d0e' }}>
              {stats.assigned}
            </div>
          </div>

          <div
            style={{
              width: '180px',
              height: '90px',
              borderRadius: '10px',
              background: '#dbeafe',
              border: '1px solid #bfdbfe',
              padding: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3a8a', marginBottom: '8px' }}>
              Resolved
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e3a8a' }}>
              {stats.resolved}
            </div>
          </div>
        </div>

        {/* Ticket list header */}
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
          All Tickets
        </div>

        {/* Tickets */}
        <div>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                width: '100%',
                height: '68px',
                borderRadius: '8px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                  #{ticket.id} — {ticket.department} — {ticket.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Status: {ticket.status}
                </div>
              </div>
              <div>
                {ticket.status === 'open' && (
                  <button
                    style={{
                      width: '140px',
                      height: '32px',
                      borderRadius: '6px',
                      background: '#16a34a',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => updateTicketStatus(ticket.id, 'assigned')}
                  >
                    Assign Casual
                  </button>
                )}
                {ticket.status === 'in_progress' && (
                  <button
                    style={{
                      width: '140px',
                      height: '32px',
                      borderRadius: '6px',
                      background: '#eab308',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                  >
                    Mark Resolved
                  </button>
                )}
                {ticket.status === 'closed' && (
                  <div style={{ width: '140px', textAlign: 'center', color: '#16a34a' }}>
                    Resolved
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}