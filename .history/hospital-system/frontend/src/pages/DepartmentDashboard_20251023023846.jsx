import React, { useState, useEffect } from "react";
import './DepartmentDashboard.css';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

export default function DepartmentDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [expandedWards, setExpandedWards] = useState(false);
  const [selectedWard, setSelectedWard] = useState(null);
  const [stats, setStats] = useState({
    patientsAdmitted: 124,
    nursesOnDuty: 38,
    bedOccupancy: 85,
    pendingTasks: 5
  });
  const [shiftSchedule] = useState([
    { shift: 'Morning Shift', nurses: 20 },
    { shift: 'Evening Shift', nurses: 15 },
    { shift: 'Night Shift', nurses: 12 }
  ]);
  const [recentNotes] = useState([
    { id: 302, ward: 'ICU', note: 'Stable, vitals improving', nurse: 'Kamau' },
    { id: 318, ward: 'Pediatrics', note: 'Needs observation', nurse: 'Achieng' },
    { id: 325, ward: 'Maternity', note: 'Post-op recovery', nurse: 'Otieno' }
  ]);

  const wards = [
    { id: 'general', name: 'General Ward' },
    { id: 'icu', name: 'ICU' },
    { id: 'maternity', name: 'Maternity' },
    { id: 'pediatrics', name: 'Pediatrics' },
    { id: 'surgical', name: 'Surgical Ward' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ticketsData = await api.get('/department/tickets');
      setTickets(ticketsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="nursing-dashboard">
        <div className="nursing-content">
          <aside className="nursing-sidebar">
            <div className="nursing-sidebar-header">
              <h1>Nursing Dept</h1>
            </div>
          </aside>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nursing-dashboard">
      <div className="nursing-content">
        {/* Sidebar */}
        <aside className="nursing-sidebar">
          <div className="nursing-sidebar-header">
            <h1>Nursing Dept</h1>
          </div>
          <nav className="nursing-sidebar-nav">
            <ul>
              <li>
                <button
                  className={currentView === 'dashboard' ? 'active' : ''}
                  onClick={() => setCurrentView('dashboard')}
                >
                  <span>🏠</span>
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'patient-rounds' ? 'active' : ''}
                  onClick={() => setCurrentView('patient-rounds')}
                >
                  <span>🩺</span>
                  <span>Patient Rounds</span>
                </button>
              </li>
              <li>
                <button
                  className="nursing-dropdown-toggle"
                  onClick={() => setExpandedWards(!expandedWards)}
                >
                  <span>🏥</span>
                  <span>Wards</span>
                  <span className={`nursing-dropdown-arrow ${expandedWards ? 'expanded' : ''}`}>▼</span>
                </button>
                {expandedWards && (
                  <ul className="nursing-dropdown-menu">
                    {wards.map(ward => (
                      <li key={ward.id}>
                        <button
                          className={selectedWard === ward.id ? 'active' : ''}
                          onClick={() => {
                            setSelectedWard(ward.id);
                            setCurrentView('ward-view');
                          }}
                        >
                          <span>• {ward.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li>
                <button
                  className={currentView === 'shift-schedules' ? 'active' : ''}
                  onClick={() => setCurrentView('shift-schedules')}
                >
                  <span>🧾</span>
                  <span>Shift Schedules</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'reports' ? 'active' : ''}
                  onClick={() => setCurrentView('reports')}
                >
                  <span>📊</span>
                  <span>Reports & Metrics</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'assignments' ? 'active' : ''}
                  onClick={() => setCurrentView('assignments')}
                >
                  <span>👩‍⚕️</span>
                  <span>Nurse Assignments</span>
                </button>
              </li>
              <li>
                <button
                  className={currentView === 'settings' ? 'active' : ''}
                  onClick={() => setCurrentView('settings')}
                >
                  <span>⚙</span>
                  <span>Settings</span>
                </button>
              </li>
              <li style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button onClick={handleLogout}>
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <header className="nursing-header">
            <h1 className="nursing-header-title">HOD - Nursing Dashboard</h1>
            <div className="nursing-header-user">
              <span>🔔</span>
              <span>HOD Wanjiru ▼</span>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="nursing-main">
            {error && (
              <div style={{ padding: '20px', background: '#fee', color: '#c00', borderRadius: '8px', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            {/* Overview Cards */}
            <div className="nursing-overview-cards">
              <div className="nursing-card">
                <h3 className="nursing-card-title">Patients Admitted</h3>
                <p className="nursing-card-value">{stats.patientsAdmitted}</p>
              </div>
              <div className="nursing-card">
                <h3 className="nursing-card-title">Nurse on Duty</h3>
                <p className="nursing-card-value">{stats.nursesOnDuty}</p>
              </div>
              <div className="nursing-card">
                <h3 className="nursing-card-title">Bed Occupancy</h3>
                <p className="nursing-card-value">{stats.bedOccupancy}%</p>
              </div>
              <div className="nursing-card">
                <h3 className="nursing-card-title">Pending Tasks</h3>
                <p className="nursing-card-value critical">{stats.pendingTasks}</p>
              </div>
            </div>

            {/* Shift Schedule Overview */}
            <div className="nursing-panel">
              <h3 className="nursing-panel-title">Shift Schedule Overview</h3>
              <div className="nursing-panel-content">
                {shiftSchedule.map((schedule, index) => (
                  <div key={index} className="nursing-panel-item">
                    • {schedule.shift} — {schedule.nurses} Nurses Assigned
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Patient Notes */}
            <div className="nursing-panel">
              <h3 className="nursing-panel-title">Recent Patient Notes</h3>
              <div className="nursing-panel-content">
                {recentNotes.map((note) => (
                  <div key={note.id} className="nursing-panel-item">
                    #{note.id} | {note.ward} - {note.note} | Nurse: {note.nurse}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="nursing-footer">
            <p>© 2025 Kenyatta National Hospital - Nursing Operations System</p>
          </footer>
        </div>
      </div>
    </div>
  );
}