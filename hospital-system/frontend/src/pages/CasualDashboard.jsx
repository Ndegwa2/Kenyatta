import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const CasualDashboard = () => {
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    fetch('/maintenance/workers')
      .then(res => res.json())
      .then(data => setWorkers(data));
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