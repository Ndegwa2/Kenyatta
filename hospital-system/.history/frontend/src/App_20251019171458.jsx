import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DepartmentDashboard from './pages/DepartmentDashboard';
import AdminDashboard from './pages/AdminDashboard';
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
          <Route path="/casual" element={<CasualDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;