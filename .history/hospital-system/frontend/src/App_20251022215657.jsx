import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/AdminTickets';
import AdminCasuals from './pages/AdminCasuals';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import CasualDashboard from './pages/CasualDashboard';

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/department" element={<DepartmentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/casuals" element={<AdminCasuals />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/casual" element={<CasualDashboard />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;