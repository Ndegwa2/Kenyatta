import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../services/auth';

export default function AdminCasuals() {
  const navigate = useNavigate();
  const [casuals, setCasuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCasual, setNewCasual] = useState({
    name: '',
    email: '',
    phone: '',
    department: ''
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
    fetchCasuals();
  }, []);

  const fetchCasuals = async () => {
    try {
      setLoading(true);
      const casualsData = await api.get('/admin/casuals');
      setCasuals(Array.isArray(casualsData) ? casualsData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching casuals:', err);
      setError(err.message || 'Failed to fetch casuals');
      setCasuals([]);
      setLoading(false);
    }
  };

  const handleAddCasual = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/casuals', newCasual);
      setShowAddModal(false);
      setNewCasual({ name: '', email: '', phone: '', department: '' });
      fetchCasuals();
    } catch (err) {
      setError('Failed to add casual worker');
    }
  };

  const handleDeleteCasual = async (casualId) => {
    if (window.confirm('Are you sure you want to delete this casual worker?')) {
      try {
        await api.delete(`/admin/casuals/${casualId}`);
        fetchCasuals();
      } catch (err) {
        setError('Failed to delete casual worker');
      }
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
        Loading casual workers...
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
      <h2 style={{ marginLeft: '230px' }}>Admin - Casual Workers Management</h2>

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
              backgroundColor: 'rgba(255,255,255,0.1)',
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
            Casual Workers Management
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Casual Worker
          </button>
        </div>

        {/* Casuals List */}
        <div>
          {casuals.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
              background: '#fff',
              borderRadius: '8px'
            }}>
              No casual workers found
            </div>
          ) : (
            casuals.map((casual) => (
              <div
                key={casual.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e6eefb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>{casual.name}</h3>
                  <p style={{ margin: '4px 0', color: '#6b7280' }}>Email: {casual.email}</p>
                  <p style={{ margin: '4px 0', color: '#6b7280' }}>Phone: {casual.phone}</p>
                  <p style={{ margin: '4px 0', color: '#6b7280' }}>Department: {casual.department}</p>
                </div>
                <button
                  onClick={() => handleDeleteCasual(casual.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Casual Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90%'
            }}>
              <h2 style={{ marginTop: 0 }}>Add Casual Worker</h2>
              <form onSubmit={handleAddCasual}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Name:</label>
                  <input
                    type="text"
                    value={newCasual.name}
                    onChange={(e) => setNewCasual({...newCasual, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
                  <input
                    type="email"
                    value={newCasual.email}
                    onChange={(e) => setNewCasual({...newCasual, email: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Phone:</label>
                  <input
                    type="tel"
                    value={newCasual.phone}
                    onChange={(e) => setNewCasual({...newCasual, phone: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px' }}>Department:</label>
                  <input
                    type="text"
                    value={newCasual.department}
                    onChange={(e) => setNewCasual({...newCasual, department: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6b7280',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Worker
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}