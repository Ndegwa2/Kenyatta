import React from 'react';

const Sidebar = ({ role }) => {
  return (
    <aside className="sidebar">
      <ul>
        {role === 'patient' && (
          <>
            <li>Profile</li>
            <li>My Tickets</li>
            <li>Create Ticket</li>
          </>
        )}
        {role === 'department' && (
          <>
            <li>Tickets</li>
            <li>Update Status</li>
          </>
        )}
        {role === 'admin' && (
          <>
            <li>Users</li>
            <li>Statistics</li>
            <li>Create User</li>
          </>
        )}
        {role === 'casual' && (
          <>
            <li>Workers</li>
            <li>Add Worker</li>
          </>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;