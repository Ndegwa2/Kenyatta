import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
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
          <div className="main-header">
            <h2>Casual Workers Dashboard</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Add Worker'}
            </button>
          </div>
          
          {showCreateForm && (
            <Card className="mb-6">
              <div className="card__header">
                <h3 className="card__title">Add New Worker</h3>
              </div>
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
            </Card>
          )}

          <h3 className="mb-4">Casual Workers</h3>
          {workers.length === 0 ? (
            <Card>
              <p className="text-center text-secondary">No workers found.</p>
            </Card>
          ) : (
            workers.map(worker => (
              <Card key={worker.id} className="mb-4">
                <div className="card__header">
                  <h4 className="card__title">{worker.name}</h4>
                </div>
                <p className="mb-2"><strong>Task:</strong> {worker.task}</p>
              </Card>
            ))
          )}
        </main>
      </div>
    </div>
  );
};

export default CasualDashboard;