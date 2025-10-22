import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

const Sidebar = ({ role }) => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const menuItems = {
    patient: [
      { icon: '👤', label: 'Profile', id: 'profile' },
      { icon: '🎫', label: 'My Tickets', id: 'tickets' },
      { icon: '➕', label: 'Create Ticket', id: 'create' }
    ],
    department: [
      { icon: '🏥', label: 'Nursing Dashboard', id: 'dashboard' },
      { icon: '🎫', label: 'Maintenance Requests', id: 'tickets' },
      { icon: '📝', label: 'Report Issue', id: 'raise-issue' }
    ],
    admin: [
      { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
      { icon: '🎫', label: 'Tickets', id: 'tickets' },
      { icon: '👷', label: 'Casuals', id: 'casuals' },
      { icon: '📊', label: 'Reports', id: 'reports' },
      { icon: '⚙', label: 'Settings', id: 'settings' }
    ],
    casual: [
      { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
      { icon: '🎫', label: 'My Tasks', id: 'tasks' },
      { icon: '📝', label: 'Update Status', id: 'update-status' }
    ]
  };

  const currentMenu = menuItems[role] || [];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>SOLU-HMS</h1>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {currentMenu.map((item) => (
            <li key={item.id}>
              <button
                className={activeItem === item.id ? 'active' : ''}
                onClick={() => setActiveItem(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
          <li className="sidebar-logout">
            <button
              className="sidebar-logout-btn"
              onClick={handleLogout}
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;