import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { api } from '../services/api';
import './MechanicalDashboard.css';

export default function MechanicalDashboard() {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [stats, setStats] = useState({
        totalWorkOrders: 0,
        openWorkOrders: 0,
        inProgressWorkOrders: 0,
        completedWorkOrders: 0,
        boilerEfficiency: 95,
        chillerOutput: 'Stable'
    });
    const [preventiveMaintenance, setPreventiveMaintenance] = useState([]);
    const [equipmentPerformance, setEquipmentPerformance] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch technician's work orders
            const workOrdersData = await api.get('/maintenance/work-orders/my');
            setWorkOrders(workOrdersData);

            // Calculate stats
            const totalWorkOrders = workOrdersData.length;
            const openWorkOrders = workOrdersData.filter(wo => wo.status === 'open' || wo.status === 'assigned').length;
            const inProgressWorkOrders = workOrdersData.filter(wo => wo.status === 'in_progress').length;
            const completedWorkOrders = workOrdersData.filter(wo => wo.status === 'completed').length;

            // Mock data for mechanical systems
            const mockPreventiveMaintenance = [
                { id: 1, date: '25 Oct', title: 'Boiler Inspection', assigned: 'Eng. Kiprop' },
                { id: 2, date: '27 Oct', title: 'HVAC Filter Change', assigned: 'Eng. Wanjiku' },
                { id: 3, date: '30 Oct', title: 'Elevator Servicing', assigned: 'Eng. Oduya' }
            ];

            const mockEquipmentPerformance = [
                { name: 'Boiler Temp', value: '178°C', status: 'normal' },
                { name: 'Chiller Status', value: 'Running', status: 'normal' },
                { name: 'Lift #3', value: 'Operational', status: 'normal' }
            ];

            setStats({
                totalWorkOrders,
                openWorkOrders,
                inProgressWorkOrders,
                completedWorkOrders,
                boilerEfficiency: 95,
                chillerOutput: 'Stable'
            });

            setPreventiveMaintenance(mockPreventiveMaintenance);
            setEquipmentPerformance(mockEquipmentPerformance);

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch work orders');
            setLoading(false);
        }
    };

    const viewWorkOrderDetails = async (workOrder) => {
        setSelectedWorkOrder(workOrder);
        try {
            const details = await api.get(`/work-order/${workOrder.id}`);
            setComments(details.comments || []);
            setCurrentView('work-order-details');
        } catch (err) {
            console.error('Failed to fetch work order details:', err);
            setError('Failed to load work order details');
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <Navbar />
                <div className="content">
                    <Sidebar role="mechanical" />
                    <main>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            Loading mechanical dashboard...
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard">
                <Navbar />
                <div className="content">
                    <Sidebar role="mechanical" />
                    <main>
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#e74c3c' }}>
                            {error}
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="mechanical-dashboard">
            <Navbar />
            <div className="content">
                <Sidebar role="mechanical" activeItem={currentView} onItemClick={setCurrentView} />
                <main>
                    {/* Header */}
                    <div className="mechanical-header">
                        <h1>🔧 HOD — Mechanical Dashboard</h1>
                        <div className="user-info">User: Kiprop</div>
                    </div>

                    {currentView === 'dashboard' && (
                        <>
                            {/* System Overview Panel */}
                            <div className="system-overview-panel">
                                <h3>System Overview</h3>
                                <div className="system-metrics">
                                    <div className="metric-item">
                                        <span className="metric-label">Boiler efficiency:</span>
                                        <span className="metric-value">{stats.boilerEfficiency}%</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">Chiller output:</span>
                                        <span className="metric-value">{stats.chillerOutput}</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">Steam pressure:</span>
                                        <span className="metric-value">Normal</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="main-content-grid">
                                {/* Preventive Maintenance Schedule */}
                                <div className="maintenance-schedule-panel">
                                    <h3>🛠️ Preventive Maintenance Schedule</h3>
                                    <ul className="maintenance-list">
                                        {preventiveMaintenance.map(item => (
                                            <li key={item.id} className="maintenance-item">
                                                <div className="maintenance-info">
                                                    <div className="maintenance-title">Next {item.title}: {item.date}</div>
                                                    <div className="maintenance-details">Assigned: {item.assigned}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Equipment Performance */}
                                <div className="equipment-performance-panel">
                                    <h3>⚙️ Equipment Performance</h3>
                                    <div className="equipment-list">
                                        {equipmentPerformance.map((item, index) => (
                                            <div key={index} className="equipment-item">
                                                <span className="equipment-name">{item.name}:</span>
                                                <span className="equipment-value">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Work Orders Table */}
                            <div className="work-orders-panel">
                                <h3>📋 Recent Work Orders</h3>
                                <table className="work-orders-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Area</th>
                                            <th>Assigned</th>
                                            <th>Status</th>
                                            <th>ETA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {workOrders.slice(0, 3).map(workOrder => (
                                            <tr key={workOrder.id}>
                                                <td>{workOrder.id}</td>
                                                <td>{workOrder.title}</td>
                                                <td>{workOrder.location}</td>
                                                <td>{workOrder.assigned_to || 'Unassigned'}</td>
                                                <td>
                                                    <span className={`status-badge status-${workOrder.status}`}>
                                                        {workOrder.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>{workOrder.estimated_hours ? `${workOrder.estimated_hours}h` : 'TBD'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {currentView === 'work-orders' && (
                        <>
                            <div className="page-header">
                                <h2>📋 Work Orders</h2>
                                <button className="btn btn-primary">+ New Work Order</button>
                            </div>

                            <div className="filters-section">
                                <div className="filter-group">
                                    <label>Status:</label>
                                    <select>
                                        <option>All</option>
                                        <option>Open</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Priority:</label>
                                    <select>
                                        <option>All</option>
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Category:</label>
                                    <select>
                                        <option>All</option>
                                        <option>Mechanical</option>
                                        <option>HVAC</option>
                                        <option>Plumbing</option>
                                    </select>
                                </div>
                            </div>

                            <div className="work-orders-grid">
                                {workOrders.map(workOrder => (
                                    <div key={workOrder.id} className="work-order-card" onClick={() => viewWorkOrderDetails(workOrder)}>
                                        <div className="work-order-header">
                                            <h4>{workOrder.title}</h4>
                                            <span className={`status-badge status-${workOrder.status}`}>
                                                {workOrder.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="work-order-details">
                                            <p><strong>Location:</strong> {workOrder.location}</p>
                                            <p><strong>Priority:</strong> {workOrder.priority}</p>
                                            <p><strong>Assigned:</strong> {workOrder.assigned_to || 'Unassigned'}</p>
                                            <p><strong>ETA:</strong> {workOrder.estimated_hours ? `${workOrder.estimated_hours}h` : 'TBD'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Footer */}
                    <div className="mechanical-footer">
                        <p>© 2025 Kenyatta National Hospital - Mechanical Maintenance System</p>
                    </div>
                </main>
            </div>
        </div>
    );
}