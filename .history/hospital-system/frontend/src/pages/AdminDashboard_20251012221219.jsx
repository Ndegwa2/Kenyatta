import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch('/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Sidebar role="admin" />
        <main>
          <h2>Admin Dashboard</h2>
          <div className="stats">
            <p>Patients: {stats.patients}</p>
            <p>Departments: {stats.departments}</p>
            <p>Tickets: {stats.tickets}</p>
            <p>Casual Workers: {stats.casual_workers}</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;