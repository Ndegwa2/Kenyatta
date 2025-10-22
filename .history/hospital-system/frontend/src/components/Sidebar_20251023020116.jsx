import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

const Sidebar = ({ role, activeItem, onItemClick }) => {
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState({});

  const handleLogout = async () => {
    try {
      await auth.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const toggleDropdown = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
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
    ],
    electrician: [
      { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
      { icon: '🔧', label: 'Work Orders', id: 'work-orders' },
      { icon: '🛠️', label: 'Preventive Maintenance', id: 'preventive-maintenance' },
      { icon: '⚡', label: 'Generators', id: 'generators' },
      { icon: '🔋', label: 'UPS & Power', id: 'ups-power' },
      { icon: '📦', label: 'Assets', id: 'assets' },
      { icon: '📊', label: 'Reports', id: 'reports' },
      { icon: '⚙️', label: 'Settings', id: 'settings' }
    ],
    maintenance_manager: [
      { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
      { icon: '🎫', label: 'All Work Orders', id: 'work-orders' },
      { icon: '👷', label: 'Technicians', id: 'technicians' },
      { icon: '📊', label: 'Reports', id: 'reports' }
    ],
    mechanical: [
      { icon: '🏠', label: 'Dashboard', id: 'dashboard' },
      { icon: '🛠️', label: 'Preventive Maintenance', id: 'preventive-maintenance' },
      { icon: '📋', label: 'Work Orders', id: 'work-orders' },
      {
        icon: '📦',
        label: 'Equipment Inventory',
        id: 'equipment-inventory',
        dropdown: true,
        children: [
          { label: 'Boilers & Steam Systems', id: 'boilers-steam' },
          { label: 'HVAC & Air Handling Units', id: 'hvac-units' },
          { label: 'Lifts & Elevators', id: 'lifts-elevators' },
          { label: 'Medical Gas Systems', id: 'medical-gas' },
          { label: 'Kitchen & Laundry Equipment', id: 'kitchen-laundry' },
          { label: 'Plumbing & Pumps', id: 'plumbing-pumps' }
        ]
      },
      { icon: '📊', label: 'Reports & Analytics', id: 'reports' },
      { icon: '👷', label: 'Team Assignments', id: 'team-assignments' },
      { icon: '⚙️', label: 'Settings', id: 'settings' }
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
                className={`${activeItem === item.id ? 'active' : ''} ${item.dropdown ? 'dropdown-toggle' : ''}`}
                onClick={() => {
                  if (item.dropdown) {
                    toggleDropdown(item.id);
                  } else {
                    onItemClick ? onItemClick(item.id) : null;
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.dropdown && (
                  <span className={`dropdown-arrow ${expandedItems[item.id] ? 'expanded' : ''}`}>
                    ▼
                  </span>
                )}
              </button>
              {item.dropdown && expandedItems[item.id] && (
                <ul className="dropdown-menu">
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <button
                        className={activeItem === child.id ? 'active' : ''}
                        onClick={() => onItemClick ? onItemClick(child.id) : null}
                      >
                        <span>• {child.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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