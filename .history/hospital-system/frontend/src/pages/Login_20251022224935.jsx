import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('patient');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await auth.register(username, password, role);
        setError('Registration successful! You can now log in.');
        setIsRegistering(false);
      } else {
        const data = await auth.login(username, password);
        // Redirect based on role
        if (data.role === 'patient') {
          navigate('/patient');
        } else if (data.role === 'admin') {
          navigate('/admin');
        } else if (data.role === 'department') {
          navigate('/department'); // department users go to department dashboard
        } else if (data.role === 'technician') {
          navigate('/casual'); // technicians go to casual dashboard
        } else {
          // Default to admin dashboard if role is not recognized
          navigate('/admin');
        }
      }
    } catch (error) {
      setError(error.message || (isRegistering ? 'Registration failed.' : 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  // Sample credentials for testing
  const sampleCredentials = [
    { role: 'Admin', username: 'admin@hospital.com', password: 'admin123' },
    { role: 'Patient 1', username: 'patient1@hospital.com', password: 'patient123' },
    { role: 'Patient 2', username: 'patient2@hospital.com', password: 'patient123' },
    { role: 'Nurse (Requester)', username: 'nurse@hospital.com', password: 'staff123' },
    { role: 'Doctor (Requester)', username: 'doctor@hospital.com', password: 'staff123' },
    { role: 'Electrician (Tech)', username: 'electrician@hospital.com', password: 'tech123' },
    { role: 'Plumber (Tech)', username: 'plumber@hospital.com', password: 'tech123' },
    { role: 'General Tech', username: 'general@hospital.com', password: 'tech123' }
  ];

  return (
    <div className="login">
      <div className="login-header">
        <h2>Hospital Management System</h2>
        <p className="login-subtitle">SOLU-HMS</p>
      </div>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            disabled={loading}
          />
        </div>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {isRegistering && (
          <div className="form-group">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control"
              disabled={loading}
            >
              <option value="patient">Patient</option>
              <option value="requester">Staff (Requester)</option>
              <option value="technician">Technician</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (isRegistering ? 'Registering...' : 'Logging in...') : (isRegistering ? 'Register' : 'Login')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
          }}
          disabled={loading}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </form>
      
      {/* Sample credentials for testing */}
      {!isRegistering && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          fontSize: '0.9rem'
        }}>
          <h4 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Test Credentials</h4>
          {sampleCredentials.map((cred, index) => (
            <div key={index} style={{ marginBottom: '0.5rem' }}>
              <strong>{cred.role}:</strong> {cred.username} / {cred.password}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Login;