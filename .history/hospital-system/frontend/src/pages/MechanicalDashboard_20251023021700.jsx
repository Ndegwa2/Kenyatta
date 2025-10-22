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

                    {currentView === 'preventive-maintenance' && (
                        <>
                            <div className="page-header">
                                <h2>🛠️ Preventive Maintenance Schedule</h2>
                                <button className="btn btn-primary">+ Schedule Maintenance</button>
                            </div>

                            <div className="maintenance-calendar">
                                <div className="calendar-header">
                                    <h3>Upcoming Maintenance Tasks</h3>
                                    <div className="calendar-nav">
                                        <button>{'< Previous'}</button>
                                        <span>October 2025</span>
                                        <button>{'Next >'}</button>
                                    </div>
                                </div>

                                <div className="maintenance-schedule">
                                    {preventiveMaintenance.concat([
                                        { id: 4, date: '28 Oct', title: 'Medical Gas System Check', assigned: 'Eng. Kiprop' },
                                        { id: 5, date: '31 Oct', title: 'Kitchen Equipment Inspection', assigned: 'Eng. Kiprop' },
                                        { id: 6, date: '2 Nov', title: 'Plumbing System Test', assigned: 'Eng. Kiprop' }
                                    ]).map(item => (
                                        <div key={item.id} className="maintenance-schedule-item">
                                            <div className="schedule-date">{item.date}</div>
                                            <div className="schedule-content">
                                                <h4>{item.title}</h4>
                                                <p>Assigned: {item.assigned}</p>
                                                <div className="schedule-actions">
                                                    <button className="btn btn-sm btn-outline">Mark Complete</button>
                                                    <button className="btn btn-sm btn-outline">Reschedule</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="maintenance-stats">
                                <div className="stat-card">
                                    <h4>Completed This Month</h4>
                                    <div className="stat-value">8</div>
                                </div>
                                <div className="stat-card">
                                    <h4>Overdue Tasks</h4>
                                    <div className="stat-value overdue">1</div>
                                </div>
                                <div className="stat-card">
                                    <h4>Next Due</h4>
                                    <div className="stat-value">25 Oct</div>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === 'equipment-inventory' && (
                        <>
                            <div className="page-header">
                                <h2>📦 Equipment Inventory</h2>
                                <button className="btn btn-primary">+ Add Equipment</button>
                            </div>

                            <div className="equipment-categories">
                                <h3>Equipment Categories</h3>
                                <div className="category-grid">
                                    <div className="category-card">
                                        <h4>🔥 Boilers & Steam Systems</h4>
                                        <p>Main hospital boiler and steam distribution</p>
                                        <div className="category-stats">
                                            <span>Active: 2</span>
                                            <span>Maintenance: 0</span>
                                        </div>
                                    </div>
                                    <div className="category-card">
                                        <h4>❄️ HVAC & Air Handling Units</h4>
                                        <p>Climate control and ventilation systems</p>
                                        <div className="category-stats">
                                            <span>Active: 5</span>
                                            <span>Maintenance: 1</span>
                                        </div>
                                    </div>
                                    <div className="category-card">
                                        <h4>🏢 Lifts & Elevators</h4>
                                        <p>Patient and staff elevators</p>
                                        <div className="category-stats">
                                            <span>Active: 3</span>
                                            <span>Maintenance: 0</span>
                                        </div>
                                    </div>
                                    <div className="category-card">
                                        <h4>🏥 Medical Gas Systems</h4>
                                        <p>Oxygen and medical gas distribution</p>
                                        <div className="category-stats">
                                            <span>Active: 4</span>
                                            <span>Maintenance: 0</span>
                                        </div>
                                    </div>
                                    <div className="category-card">
                                        <h4>🍳 Kitchen & Laundry Equipment</h4>
                                        <p>Food service and laundry machinery</p>
                                        <div className="category-stats">
                                            <span>Active: 6</span>
                                            <span>Maintenance: 2</span>
                                        </div>
                                    </div>
                                    <div className="category-card">
                                        <h4>🚰 Plumbing & Pumps</h4>
                                        <p>Water systems and circulation pumps</p>
                                        <div className="category-stats">
                                            <span>Active: 8</span>
                                            <span>Maintenance: 1</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === 'reports' && (
                        <>
                            <div className="page-header">
                                <h2>📊 Reports & Analytics</h2>
                                <button className="btn btn-primary">Generate Report</button>
                            </div>

                            <div className="reports-grid">
                                <div className="report-card">
                                    <h3>🔥 Boiler Performance Report</h3>
                                    <p>Efficiency and maintenance analysis</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Avg Efficiency:</span>
                                            <span className="metric-value">94.2%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Downtime:</span>
                                            <span className="metric-value">2.1h</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>

                                <div className="report-card">
                                    <h3>⚙️ Equipment Uptime</h3>
                                    <p>Mechanical systems availability</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Overall Uptime:</span>
                                            <span className="metric-value">97.8%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">MTBF:</span>
                                            <span className="metric-value">45 days</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>

                                <div className="report-card">
                                    <h3>🛠️ Maintenance Costs</h3>
                                    <p>Monthly maintenance expenditure</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">This Month:</span>
                                            <span className="metric-value">$12,450</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">vs Budget:</span>
                                            <span className="metric-value">85%</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>

                                <div className="report-card">
                                    <h3>⚠️ System Alerts</h3>
                                    <p>Critical alerts and warnings</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Critical:</span>
                                            <span className="metric-value critical">2</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Warnings:</span>
                                            <span className="metric-value warning">5</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === 'team-assignments' && (
                        <>
                            <div className="page-header">
                                <h2>👷 Team Assignments</h2>
                                <button className="btn btn-primary">+ Assign Task</button>
                            </div>

                            <div className="team-overview">
                                <div className="team-stats">
                                    <div className="stat-card">
                                        <h4>Total Technicians</h4>
                                        <div className="stat-value">4</div>
                                    </div>
                                    <div className="stat-card">
                                        <h4>Active Tasks</h4>
                                        <div className="stat-value">6</div>
                                    </div>
                                    <div className="stat-card">
                                        <h4>Available</h4>
                                        <div className="stat-value">2</div>
                                    </div>
                                </div>

                                <div className="technician-list">
                                    <h3>Mechanical Team</h3>
                                    <div className="technician-cards">
                                        <div className="technician-card">
                                            <div className="technician-header">
                                                <h4>Kiprop Ndegwa</h4>
                                                <div className="status available">Available</div>
                                            </div>
                                            <div className="technician-details">
                                                <p><strong>Specialty:</strong> Mechanical</p>
                                                <p><strong>Current Tasks:</strong> 2</p>
                                                <p><strong>Skills:</strong> Boilers, HVAC, Elevators</p>
                                            </div>
                                        </div>
                                        <div className="technician-card">
                                            <h4>Eng. Sarah Wanjiku</h4>
                                            <div className="status busy">Busy</div>
                                            <div className="technician-details">
                                                <p><strong>Specialty:</strong> HVAC</p>
                                                <p><strong>Current Tasks:</strong> 3</p>
                                                <p><strong>Skills:</strong> Air Systems, Ventilation</p>
                                            </div>
                                        </div>
                                        <div className="technician-card">
                                            <h4>Eng. Michael Oduya</h4>
                                            <div className="status available">Available</div>
                                            <div className="technician-details">
                                                <p><strong>Specialty:</strong> Elevators</p>
                                                <p><strong>Current Tasks:</strong> 1</p>
                                                <p><strong>Skills:</strong> Lifts, Mechanical Systems</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === 'settings' && (
                        <>
                            <div className="page-header">
                                <h2>⚙️ Settings</h2>
                            </div>

                            <div className="settings-sections">
                                <div className="settings-section">
                                    <h3>🔔 Notifications</h3>
                                    <div className="setting-item">
                                        <label>
                                            <input type="checkbox" defaultChecked />
                                            Equipment failure alerts
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <label>
                                            <input type="checkbox" defaultChecked />
                                            Maintenance reminder notifications
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <label>
                                            <input type="checkbox" />
                                            System performance reports
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>📊 Dashboard Preferences</h3>
                                    <div className="setting-item">
                                        <label>Auto-refresh interval:</label>
                                        <select>
                                            <option>5 minutes</option>
                                            <option>10 minutes</option>
                                            <option>15 minutes</option>
                                            <option>30 minutes</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <label>Default equipment view:</label>
                                        <select>
                                            <option>All Systems</option>
                                            <option>Critical Only</option>
                                            <option>By Category</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>🔧 Maintenance Settings</h3>
                                    <div className="setting-item">
                                        <label>Preventive maintenance alerts:</label>
                                        <select>
                                            <option>7 days before</option>
                                            <option>14 days before</option>
                                            <option>30 days before</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <label>Auto-assign work orders:</label>
                                        <select>
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                    </div>
                                </div>
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