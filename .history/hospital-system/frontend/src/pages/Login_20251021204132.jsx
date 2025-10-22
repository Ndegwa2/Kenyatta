import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await auth.login(username, password);
      // Redirect based on role
      if (data.role && ['patient', 'department', 'admin', 'casual'].includes(data.role)) {
        navigate(`/${data.role}`);
      } else {
        // Default to admin dashboard if role is not recognized
        navigate('/admin');
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Sample credentials for testing
  const sampleCredentials = [
    { role: 'Admin', username: 'admin@hospital.com', password: 'admin123' },
    { role: 'Patient', username: 'patient@hospital.com', password: 'patient123' },
    { role: 'Emergency Dept', username: 'emergency@hospital.com', password: 'dept123' },
    { role: 'Cardiology Dept', username: 'cardiology@hospital.com', password: 'dept123' },
    { role: 'Casual Worker', username: 'casual@hospital.com', password: 'casual123' }
  ];

  return (
    <div className="login">
      <div className="login-header">
        <h2>Hospital Management System</h2>
        <p className="login-subtitle">SOLU-HMS</p>
      </div>
      <form onSubmit={handleLogin} className="login-form">
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
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {/* Sample credentials for testing */}
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
    </div>
  );
};

export default Login;