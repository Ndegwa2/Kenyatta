import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';

const PatientDashboard = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch('/patient/tickets')
      .then(res => res.json())
      .then(data => setTickets(data));
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Sidebar role="patient" />
        <main>
          <h2>My Tickets</h2>
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;