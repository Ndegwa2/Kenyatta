import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

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
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      let endpoint = '/admin/reports';
      if (dateRange.start && dateRange.end) {
        endpoint += `?start=${dateRange.start}&end=${dateRange.end}`;
      }
      const reportsData = await api.get(endpoint);
      setReports(reportsData || {});
      setLoading(false);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Failed to fetch reports');
      setReports({});
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      let endpoint = `/admin/reports/export?format=${format}`;
      if (dateRange.start && dateRange.end) {
        endpoint += `&start=${dateRange.start}&end=${dateRange.end}`;
      }
      const response = await api.get(endpoint, { responseType: 'blob' });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hospital-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export report');
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
        Loading reports...
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
      <h2 style={{ marginLeft: '230px' }}>Admin - Reports & Analytics</h2>

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
              backgroundColor: 'transparent',
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
              backgroundColor: 'rgba(255,255,255,0.1)',
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
            Reports & Analytics
          </h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => exportReport('pdf')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Export PDF
            </button>
            <button
              onClick={() => exportReport('csv')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e6eefb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Filter by Date Range</h3>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Start Date:</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                style={{
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>End Date:</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                style={{
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              />
            </div>
            <button
              onClick={fetchReports}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                alignSelf: 'flex-end'
              }}
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Report Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e6eefb',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Total Tickets</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
              {reports.totalTickets || 0}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e6eefb',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Resolved Tickets</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>
              {reports.resolvedTickets || 0}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e6eefb',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Pending Tickets</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
              {reports.pendingTickets || 0}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1px solid #e6eefb',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Average Resolution Time</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {reports.avgResolutionTime || '0h'}
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e6eefb',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Department Performance</h3>
          {reports.departmentStats && reports.departmentStats.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {reports.departmentStats.map((dept, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f8fafc',
                  borderRadius: '4px'
                }}>
                  <span style={{ fontWeight: '500' }}>{dept.name}</span>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <span>Tickets: {dept.tickets}</span>
                    <span>Resolved: {dept.resolved}</span>
                    <span>Avg Time: {dept.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>No department data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e6eefb',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Recent Activity</h3>
          {reports.recentActivity && reports.recentActivity.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {reports.recentActivity.map((activity, index) => (
                <div key={index} style={{
                  padding: '10px',
                  background: '#f8fafc',
                  borderRadius: '4px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{activity.action}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {activity.timestamp} - {activity.user}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}