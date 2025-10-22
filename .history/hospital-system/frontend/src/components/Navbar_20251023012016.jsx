import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

const Navbar = () => {
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

  return (
    <nav className="navbar">
      <h1>Hospital Management System</h1>
      <button
        className="btn btn-outline btn-sm"
        onClick={handleLogout}
        style={{ marginLeft: 'auto' }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;