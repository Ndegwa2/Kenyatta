import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';

const DepartmentDashboard = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch('/department/tickets')
      .then(res => res.json())
      .then(data => setTickets(data));
  }, []);

  return (
    <div className="dashboard">
      <Navbar />
      <div className="content">
        <Sidebar role="department" />
        <main>
          <h2>Department Tickets</h2>
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default DepartmentDashboard;