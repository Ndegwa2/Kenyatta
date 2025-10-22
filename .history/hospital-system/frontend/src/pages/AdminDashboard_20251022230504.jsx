// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';
import TicketCard from '../components/TicketCard';
import TicketDetails from '../components/TicketDetails';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

export default function AdminDashboard() {
   const navigate = useNavigate();
   const [active, setActive] = useState("Dashboard");
   const [tickets, setTickets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [selectedTicketId, setSelectedTicketId] = useState(null);
   const [stats, setStats] = useState({
     pending: 0,
     assigned: 0,
     resolved: 0,
     total_users: 0,
     total_work_orders: 0,
     total_technicians: 0,
     total_equipment: 0,
     total_tickets: 0,
     open_tickets: 0,
     closed_tickets: 0,
     emergency_work_orders: 0,
     role_distribution: {},
     weekly_quotas: {},
     top_performers: [],
     department_stats: [],
     performance_metrics: {},
     recent_activity: {}
   });

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/'); // Navigate anyway
    }
  };

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
        pending: statsData.open_tickets || 0,
        assigned: statsData.total_tickets - statsData.open_tickets - statsData.closed_tickets || 0,
        resolved: statsData.closed_tickets || 0,
        total_users: statsData.total_users || 0,
        total_work_orders: statsData.total_work_orders || 0,
        total_technicians: statsData.total_technicians || 0,
        total_equipment: statsData.total_equipment || 0,
        total_tickets: statsData.total_tickets || 0,
        open_tickets: statsData.open_tickets || 0,
        closed_tickets: statsData.closed_tickets || 0,
        emergency_work_orders: statsData.emergency_work_orders || 0,
        role_distribution: statsData.role_distribution || {},
        weekly_quotas: statsData.weekly_quotas || {},
        top_performers: statsData.top_performers || [],
        department_stats: statsData.department_stats || [],
        performance_metrics: statsData.performance_metrics || {},
        recent_activity: statsData.recent_activity || {}
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
              backgroundColor: active === 'Tickets' ? 'rgba(255,255,255,0.1)' : 'transparent',
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
              backgroundColor: active === 'Casuals' ? 'rgba(255,255,255,0.1)' : 'transparent',
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
              backgroundColor: active === 'Reports' ? 'rgba(255,255,255,0.1)' : 'transparent',
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
              backgroundColor: active === 'Settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
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
              fetchData(); // Refresh data when modal closes
            }}
          />
        )}
      </div>
    </div>
  );
}