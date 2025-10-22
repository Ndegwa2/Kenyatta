import React from 'react';

const Sidebar = ({ role }) => {
  return (
    <aside className="w-48 bg-slate-800 text-slate-100 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">SOLU-HMS</h1>
      </div>
      <nav>
        <ul className="space-y-4">
          {role === 'patient' && (
            <>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">👤 Profile</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">🎫 My Tickets</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">➕ Create Ticket</li>
            </>
          )}
          {role === 'department' && (
            <>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">🏠 Dashboard</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">🎫 Tickets</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">📝 Raise Issue</li>
            </>
          )}
          {role === 'admin' && (
            <>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">🏠 Dashboard</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">🎫 Tickets</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">👷 Casuals</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">📊 Reports</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">⚙ Settings</li>
            </>
          )}
          {role === 'casual' && (
            <>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">🏠 Dashboard</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">🎫 My Tasks</li>
              <li className="hover:bg-slate-700 p-2 rounded cursor-pointer">📝 Update Status</li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;