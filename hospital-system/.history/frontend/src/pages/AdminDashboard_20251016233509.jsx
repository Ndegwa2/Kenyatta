// src/pages/AdminDashboard.jsx
import { useState } from "react";
import { Home, Users, FileText, Settings } from "lucide-react";
import "../admin.css";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} /> },
    { name: "Users", icon: <Users size={20} /> },
    { name: "Reports", icon: <FileText size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          Hospital Admin
        </div>
        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={active === item.name ? "active" : ""}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Header */}
        <header className="header">
          <h1>{active}</h1>
          <div className="user">
            <span>Admin</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
            />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard-content">
          <div className="card">
            <h2>Total Patients</h2>
            <p>1,234</p>
          </div>

          <div className="card">
            <h2>Doctors</h2>
            <p>58</p>
          </div>

          <div className="card">
            <h2>Appointments Today</h2>
            <p>42</p>
          </div>
        </main>
      </div>
    </div>
  );
}