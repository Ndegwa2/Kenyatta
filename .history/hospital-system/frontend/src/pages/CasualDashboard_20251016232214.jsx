import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { api } from '../services/api';

const CasualDashboard = () => {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    api.get('/maintenance/workers')
      .then(data => setWorkers(data))
      .catch(error => console.error('Error fetching workers:', error));
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Sidebar role="casual" />
        <main>
          <h2>Casual Workers</h2>
          <ul>
            {workers.map(worker => (
              <li key={worker.id}>{worker.name} - {worker.task}</li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default CasualDashboard;