import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

const CasualDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    task: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch workers
      const workersData = await api.get('/maintenance/workers');
      setWorkers(workersData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch workers');
      setLoading(false);
    }
  };

  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance/worker', newWorker);
      // Reset form and refresh data
      setNewWorker({ name: '', task: '' });
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create worker');
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <Sidebar role="casual" />
          <main>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              Loading dashboard...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <Navbar />
        <div className="content">
          <Sidebar role="casual" />
          <main>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Sidebar role="casual" />
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>Casual Workers Dashboard</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Add Worker'}
            </button>
          </div>
          
          {showCreateForm && (
            <div className="ticket-card" style={{ marginBottom: '2rem' }}>
              <h3>Add New Worker</h3>
              <form onSubmit={handleCreateWorker}>
                <div className="form-group">
                  <label>Worker Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Task</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newWorker.task}
                    onChange={(e) => setNewWorker({...newWorker, task: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Worker</button>
              </form>
            </div>
          )}
          
          <h3>Casual Workers</h3>
          {workers.length === 0 ? (
            <div className="ticket-card">
              <p>No workers found.</p>
            </div>
          ) : (
            workers.map(worker => (
              <div key={worker.id} className="ticket-card" style={{ marginBottom: '1rem' }}>
                <h4>{worker.name}</h4>
                <p><strong>Task:</strong> {worker.task}</p>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default CasualDashboard;