// __define-ocg__ Department Dashboard component (simulation)
// Save as: src/pages/DepartmentDashboard.jsx

import React, { useState } from "react";
import Sidebar from '../components/Sidebar';

/*
  This is a frontend-only simulation for the Department Dashboard.
  It doesn't call a backend — it stores tickets in local state.
*/
export default function DepartmentDashboard() {
  // demo state variable requested earlier
  const [varOcg, setVarOcg] = useState(null);

  const departments = ["Radiology", "Surgery", "Laboratory", "Pharmacy"];
  const categories = ["Electrical", "Plumbing", "Carpentry", "Cleaning", "Other"];

  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tickets, setTickets] = useState([
    // sample tickets
    { id: "D-001", dept: "Radiology", category: "Plumbing", description: "Leak in X-ray room", status: "pending", createdAt: "2025-10-12" },
    { id: "D-002", dept: "Surgery", category: "Carpentry", description: "Broken drawer", status: "assigned", assignedTo: "Casual B", createdAt: "2025-10-10" },
  ]);

  function raiseTicket() {
    if (!selectedCategory) return alert("Choose an issue category.");
    const newTicket = {
      id: `D-${Date.now().toString().slice(-4)}`,
      dept: selectedDept,
      category: selectedCategory,
      description: description || `No description`,
      status: "pending",
      createdAt: new Date().toLocaleDateString(),
    };
    setTickets([newTicket, ...tickets]);
    setDescription("");
    setSelectedCategory("");
    setVarOcg(`Raised ${newTicket.id}`); // demo state usage
  }

  function markAssigned(id) {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "assigned", assignedTo: "Casual A" } : t));
  }

  function markResolved(id) {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: "resolved" } : t));
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="department" />
      <div className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏥 Department Dashboard</h1>
          <div className="text-sm text-gray-600">Simulated — no backend</div>
        </header>

        <section className="grid grid-cols-12 gap-6">
          {/* Left: Raise form */}
          <div className="col-span-5 bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3 text-green-800">Raise Department Ticket</h2>

            <label className="block text-sm text-gray-700 mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <label className="block text-sm text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border rounded p-2 mb-3"
            >
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className="block text-sm text-gray-700 mb-1">Description (optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2 mb-3"
              placeholder="Add brief details (e.g. location, urgency)"
            />

            <div className="flex gap-2">
              <button
                onClick={raiseTicket}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Raise Dept Issue
              </button>
              <button
                onClick={() => { setDescription(""); setSelectedCategory(""); }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Reset
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <strong>Note:</strong> Dept tickets are color-coded green in the admin view.
            </div>
          </div>

          {/* Right: Tickets list */}
          <div className="col-span-7 bg-white p-6 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-3 text-green-800">Department Tickets</h2>

            <div className="space-y-3">
              {tickets.map(ticket => (
                <div key={ticket.id} className={`border rounded p-3 ${ticket.status === "pending" ? "bg-white" : ticket.status === "assigned" ? "bg-yellow-50" : "bg-green-50"}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-800">{ticket.id} — {ticket.category} ({ticket.dept})</div>
                      <div className="text-xs text-gray-600">{ticket.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Raised: {ticket.createdAt}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Status</div>
                      <div className="text-sm font-semibold">{ticket.status}{ticket.assignedTo ? ` • ${ticket.assignedTo}` : ''}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {ticket.status === "pending" && (
                      <button onClick={() => markAssigned(ticket.id)} className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">Assign</button>
                    )}
                    {ticket.status !== "resolved" && (
                      <button onClick={() => markResolved(ticket.id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Mark Resolved</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {varOcg && (
          <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-800">
            Simulation note: {varOcg}
          </div>
        )}
      </div>
    </div>
  );
}