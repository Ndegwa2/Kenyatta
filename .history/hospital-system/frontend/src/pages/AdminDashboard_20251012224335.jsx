// __define-ocg__ Admin Dashboard component (simulation)
// Save as: src/pages/AdminDashboard.jsx

import React, { useState } from "react";
import Sidebar from '../components/Sidebar';

/*
  This is a frontend-only simulation for the Admin Dashboard.
  It doesn't call a backend — it stores tickets in local state.
*/
export default function AdminDashboard() {
  // demo state variable requested earlier
  const [varOcg, setVarOcg] = useState(null);

  const casualWorkers = ["Casual A", "Casual B", "Casual C"];

  const [tickets, setTickets] = useState([
    // sample tickets from different sources
    { id: "T-001", type: "department", dept: "Radiology", category: "Electrical", description: "X-ray machine sparks", status: "pending", createdAt: "2025-10-12" },
    { id: "T-002", type: "patient", patientId: "P-123", issue: "Room too cold", status: "assigned", assignedTo: "Casual A", createdAt: "2025-10-11" },
    { id: "T-003", type: "maintenance", category: "Plumbing", description: "Leak in hallway", status: "resolved", createdAt: "2025-10-10" },
    { id: "T-004", type: "department", dept: "Surgery", category: "Cleaning", description: "Floor needs mopping", status: "pending", createdAt: "2025-10-12" },
    { id: "T-005", type: "patient", patientId: "P-456", issue: "TV not working", status: "assigned", assignedTo: "Casual B", createdAt: "2025-10-11" },
  ]);

  const pendingCount = tickets.filter(t => t.status === "pending").length;
  const assignedCount = tickets.filter(t => t.status === "assigned").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;

  function assignTicket(id, worker) {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "assigned", assignedTo: worker } : t));
    setVarOcg(`Assigned ${id} to ${worker}`);
  }

  function markResolved(id) {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "resolved" } : t));
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="text-sm text-gray-600">Simulated — no backend</div>
        </header>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-green-100 border border-green-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-green-800">Pending Tickets</h3>
            <p className="text-3xl font-bold text-green-800">{pendingCount}</p>
          </div>
          <div className="bg-yellow-100 border border-yellow-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-yellow-800">Assigned</h3>
            <p className="text-3xl font-bold text-yellow-800">{assignedCount}</p>
          </div>
          <div className="bg-blue-100 border border-blue-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800">Resolved</h3>
            <p className="text-3xl font-bold text-blue-800">{resolvedCount}</p>
          </div>
        </div>

        {/* Ticket list */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">All Tickets</h2>

          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className={`border rounded-lg p-4 ${ticket.status === "pending" ? "bg-white" : ticket.status === "assigned" ? "bg-yellow-50" : "bg-green-50"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {ticket.id} —
                      {ticket.type === "department" ? `${ticket.dept} — ${ticket.category}` :
                       ticket.type === "patient" ? `Patient ${ticket.patientId} — ${ticket.issue}` :
                       `${ticket.category} — ${ticket.description}`}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Status: {ticket.status}{ticket.assignedTo ? ` • Assigned to ${ticket.assignedTo}` : ''}</div>
                    <div className="text-xs text-gray-500 mt-1">Created: {ticket.createdAt}</div>
                  </div>
                  <div className="flex gap-2">
                    {ticket.status === "pending" && (
                      <select onChange={(e) => assignTicket(ticket.id, e.target.value)} className="px-3 py-1 border rounded text-sm">
                        <option value="">Assign to...</option>
                        {casualWorkers.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    )}
                    {ticket.status !== "resolved" && (
                      <button onClick={() => markResolved(ticket.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Mark Resolved</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {varOcg && (
          <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-800">
            Simulation note: {varOcg}
          </div>
        )}
      </div>
    </div>
  );
}