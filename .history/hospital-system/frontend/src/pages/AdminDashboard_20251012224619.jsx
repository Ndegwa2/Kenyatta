// src/pages/AdminDashboard.jsx
import { useState } from "react";
import { Home, Users, FileText, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [active, setActive] = useState("Dashboard");

  const menuItems = [
    { name: "Dashboard", icon: <Home size={20} /> },
    { name: "Users", icon: <Users size={20} /> },
    { name: "Reports", icon: <FileText size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-blue-700">
          Hospital Admin
        </div>
        <nav className="flex-1 p-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex items-center w-full px-4 py-2 mb-2 rounded-lg ${
                active === item.name
                  ? "bg-blue-700 text-white"
                  : "text-gray-200 hover:bg-blue-800"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">{active}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-600 text-sm">Total Patients</h2>
            <p className="text-2xl font-bold mt-2">1,234</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-600 text-sm">Doctors</h2>
            <p className="text-2xl font-bold mt-2">58</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-600 text-sm">Appointments Today</h2>
            <p className="text-2xl font-bold mt-2">42</p>
          </div>
        </main>
      </div>
    </div>
  );
}