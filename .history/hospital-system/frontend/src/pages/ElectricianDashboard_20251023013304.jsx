import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { api } from '../services/api';
import './ElectricianDashboard.css';

export default function ElectricianDashboard() {
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
        generatorsOnline: 2,
        upsHealth: 76
    });
    const [preventiveMaintenance, setPreventiveMaintenance] = useState([]);
    const [energyUsage, setEnergyUsage] = useState([]);
    const [assetMap, setAssetMap] = useState([]);
    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        actualHours: ''
    });
    const [attachments, setAttachments] = useState([]);
    const [newAttachment, setNewAttachment] = useState(null);

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

            // Mock data for new features (in real app, these would come from API)
            const mockPreventiveMaintenance = [
                { id: 1, date: '24 Oct', title: 'Generator 2 — Oil change', assigned: 'Eng. Mwangi' },
                { id: 2, date: '25 Oct', title: 'Main UPS — Battery health check', assigned: 'Eng. Achieng' },
                { id: 3, date: '27 Oct', title: 'ICU AC — Filter replacement', assigned: 'Eng. Otieno' },
                { id: 4, date: '29 Oct', title: 'Main switchboard — Thermographic scan', assigned: 'Eng. Njeri' }
            ];

            const mockEnergyUsage = [
                { time: '00:00', value: 120 },
                { time: '04:00', value: 80 },
                { time: '08:00', value: 160 },
                { time: '12:00', value: 200 },
                { time: '16:00', value: 180 },
                { time: '20:00', value: 140 }
            ];

            const mockAssetMap = [
                { id: 1, name: 'Gen1', status: 'ok' },
                { id: 2, name: 'UPS Rack', status: 'attention' }
            ];

            setStats({
                totalWorkOrders,
                openWorkOrders,
                inProgressWorkOrders,
                completedWorkOrders,
                generatorsOnline: 2,
                upsHealth: 76
            });

            setPreventiveMaintenance(mockPreventiveMaintenance);
            setEnergyUsage(mockEnergyUsage);
            setAssetMap(mockAssetMap);

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch work orders');
            setLoading(false);
        }
    };

    const viewWorkOrderDetails = async (workOrder) => {
        setSelectedWorkOrder(workOrder);
        try {
            // Fetch work order details with comments and attachments
            const details = await api.get(`/work-order/${workOrder.id}`);
            setComments(details.comments || []);
            setAttachments(details.attachments || []);
            setCurrentView('work-order-details');
        } catch (err) {
            console.error('Failed to fetch work order details:', err);
            setError('Failed to load work order details');
        }
    };

    const updateWorkOrderStatus = async () => {
        if (!selectedWorkOrder || !statusUpdate.status) return;

        try {
            await api.put(`/work-order/${selectedWorkOrder.id}/status`, {
                status: statusUpdate.status,
                actual_hours: statusUpdate.actualHours ? parseFloat(statusUpdate.actualHours) : null
            });

            // Refresh data
            await fetchData();
            // Refresh current work order details
            const details = await api.get(`/work-order/${selectedWorkOrder.id}`);
            setSelectedWorkOrder(details);
            setComments(details.comments || []);
            setAttachments(details.attachments || []);

            setStatusUpdate({ status: '', actualHours: '' });
        } catch (err) {
            setError('Failed to update work order status');
        }
    };

    const addComment = async () => {
        if (!newComment.trim() || !selectedWorkOrder) return;

        try {
            await api.post(`/work-order/${selectedWorkOrder.id}/comment`, {
                comment: newComment
            });
            setNewComment('');

            // Refresh comments
            const details = await api.get(`/work-order/${selectedWorkOrder.id}`);
            setComments(details.comments || []);
        } catch (err) {
            setError('Failed to add comment');
        }
    };

    const uploadAttachment = async () => {
        if (!newAttachment || !selectedWorkOrder) return;

        const formData = new FormData();
        formData.append('file', newAttachment);

        try {
            await api.post(`/work-order/${selectedWorkOrder.id}/attachment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Refresh attachments
            const details = await api.get(`/work-order/${selectedWorkOrder.id}`);
            setAttachments(details.attachments || []);
            setNewAttachment(null);
        } catch (err) {
            setError('Failed to upload attachment');
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <Navbar />
                <div className="content">
                    <Sidebar role="electrician" />
                    <main>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            Loading electrician dashboard...
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
                    <Sidebar role="electrician" />
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
        <div className="electrician-dashboard">
            <Navbar />
            <div className="content">
                <Sidebar role="electrician" activeItem={currentView} onItemClick={setCurrentView} />
                <main>
                    {/* Header */}
                    <div className="electrician-header">
                        <h1>⚡ HOD — Electricals</h1>
                        <div className="user-info">User: Ndegwa</div>
                    </div>

                    {currentView === 'dashboard' && (
                        <>
                            {/* KPI Cards */}
                            <div className="kpi-grid">
                                <div className="kpi-card active-work-orders">
                                    <div className="kpi-title">Active Work Orders</div>
                                    <div className="kpi-value">{stats.totalWorkOrders}</div>
                                    <div className="kpi-change">+3 since yesterday</div>
                                </div>

                                <div className="kpi-card generators-online">
                                    <div className="kpi-title">Generators Online</div>
                                    <div className="generator-icons">
                                        <div className="generator-icon online">⚡</div>
                                        <div className="generator-icon online">⚡</div>
                                    </div>
                                    <div className="kpi-value">{stats.generatorsOnline}</div>
                                </div>

                                <div className="kpi-card ups-health">
                                    <div className="kpi-title">UPS Health</div>
                                    <div className="ups-health-bar">
                                        <div className="ups-health-fill" style={{ width: `${stats.upsHealth}%` }}></div>
                                    </div>
                                    <div className="kpi-value">Good — {stats.upsHealth}% capacity</div>
                                </div>
                            </div>

                            {/* Main Content Grid */}
                            <div className="main-content-grid">
                                {/* Preventive Maintenance */}
                                <div className="content-card">
                                    <h3>🛠️ Preventive Maintenance (Next 7 days)</h3>
                                    <ul className="maintenance-list">
                                        {preventiveMaintenance.map(item => (
                                            <li key={item.id} className="maintenance-item">
                                                <div className="maintenance-info">
                                                    <div className="maintenance-title">{item.date} — {item.title}</div>
                                                    <div className="maintenance-details">Assigned: {item.assigned}</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Energy Usage Chart */}
                                <div className="content-card">
                                    <h3>📊 Energy Usage (24h)</h3>
                                    <div className="energy-chart">
                                        <svg className="energy-sparkline" viewBox="0 0 300 150">
                                            <polyline
                                                points={energyUsage.map((point, index) =>
                                                    `${index * 50},${150 - (point.value / 2)}`
                                                ).join(' ')}
                                            />
                                        </svg>
                                        <div className="energy-axis">kWh</div>
                                    </div>
                                </div>
                            </div>

                            {/* Work Orders Table */}
                            <div className="content-card">
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
                                        <option>Electrical</option>
                                        <option>Mechanical</option>
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
                                        <button>< Previous</button>
                                        <span>October 2025</span>
                                        <button>Next ></button>
                                    </div>
                                </div>

                                <div className="maintenance-schedule">
                                    {preventiveMaintenance.map(item => (
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
                                    <div className="stat-value">12</div>
                                </div>
                                <div className="stat-card">
                                    <h4>Overdue Tasks</h4>
                                    <div className="stat-value overdue">2</div>
                                </div>
                                <div className="stat-card">
                                    <h4>Next Due</h4>
                                    <div className="stat-value">24 Oct</div>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === 'generators' && (
                        <>
                            <div className="page-header">
                                <h2>⚡ Generators</h2>
                                <button className="btn btn-primary">+ Add Generator</button>
                            </div>

                            <div className="generators-grid">
                                <div className="generator-card">
                                    <div className="generator-header">
                                        <h3>Generator 1 - Main Building</h3>
                                        <div className="generator-status online">Online</div>
                                    </div>
                                    <div className="generator-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Fuel Level:</span>
                                            <span className="metric-value">85%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Runtime:</span>
                                            <span className="metric-value">2.5h</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Load:</span>
                                            <span className="metric-value">60%</span>
                                        </div>
                                    </div>
                                    <div className="generator-actions">
                                        <button className="btn btn-sm btn-outline">Start</button>
                                        <button className="btn btn-sm btn-outline">Stop</button>
                                        <button className="btn btn-sm btn-outline">Maintenance</button>
                                    </div>
                                </div>

                                <div className="generator-card">
                                    <div className="generator-header">
                                        <h3>Generator 2 - Emergency Wing</h3>
                                        <div className="generator-status standby">Standby</div>
                                    </div>
                                    <div className="generator-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Fuel Level:</span>
                                            <span className="metric-value">92%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Runtime:</span>
                                            <span className="metric-value">0.0h</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Load:</span>
                                            <span className="metric-value">0%</span>
                                        </div>
                                    </div>
                                    <div className="generator-actions">
                                        <button className="btn btn-sm btn-outline">Start</button>
                                        <button className="btn btn-sm btn-outline">Stop</button>
                                        <button className="btn btn-sm btn-outline">Maintenance</button>
                                    </div>
                                </div>

                                <div className="generator-card">
                                    <div className="generator-header">
                                        <h3>Generator 3 - ICU</h3>
                                        <div className="generator-status maintenance">Maintenance</div>
                                    </div>
                                    <div className="generator-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Fuel Level:</span>
                                            <span className="metric-value">45%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Last Service:</span>
                                            <span className="metric-value">15 Oct</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Next Service:</span>
                                            <span className="metric-value">15 Nov</span>
                                        </div>
                                    </div>
                                    <div className="generator-actions">
                                        <button className="btn btn-sm btn-outline">Complete Maintenance</button>
                                        <button className="btn btn-sm btn-outline">Schedule Service</button>
                                    </div>
                                </div>
                            </div>

                            <div className="generator-alerts">
                                <h3>⚠️ Alerts</h3>
                                <div className="alert-item warning">
                                    <span>Generator 3 fuel level low</span>
                                    <button className="btn btn-sm">Refuel</button>
                                </div>
                                <div className="alert-item info">
                                    <span>Monthly test scheduled for tomorrow</span>
                                    <button className="btn btn-sm">View Schedule</button>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === 'ups-power' && (
                        <>
                            <div className="page-header">
                                <h2>🔋 UPS & Power Systems</h2>
                                <button className="btn btn-primary">+ Add UPS</button>
                            </div>

                            <div className="ups-grid">
                                <div className="ups-card">
                                    <div className="ups-header">
                                        <h3>Main UPS Rack A</h3>
                                        <div className="ups-status healthy">Healthy</div>
                                    </div>
                                    <div className="ups-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Battery Health:</span>
                                            <span className="metric-value">95%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Load:</span>
                                            <span className="metric-value">45%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Runtime:</span>
                                            <span className="metric-value">8.2h</span>
                                        </div>
                                    </div>
                                    <div className="battery-chart">
                                        <div className="battery-level" style={{ width: '95%' }}></div>
                                    </div>
                                </div>

                                <div className="ups-card">
                                    <div className="ups-header">
                                        <h3>Server Room UPS</h3>
                                        <div className="ups-status warning">Warning</div>
                                    </div>
                                    <div className="ups-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Battery Health:</span>
                                            <span className="metric-value">78%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Load:</span>
                                            <span className="metric-value">72%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Runtime:</span>
                                            <span className="metric-value">4.1h</span>
                                        </div>
                                    </div>
                                    <div className="battery-chart">
                                        <div className="battery-level warning" style={{ width: '78%' }}></div>
                                    </div>
                                </div>

                                <div className="ups-card">
                                    <div className="ups-header">
                                        <h3>ICU Critical Systems</h3>
                                        <div className="ups-status critical">Critical</div>
                                    </div>
                                    <div className="ups-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Battery Health:</span>
                                            <span className="metric-value">45%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Load:</span>
                                            <span className="metric-value">85%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Runtime:</span>
                                            <span className="metric-value">2.3h</span>
                                        </div>
                                    </div>
                                    <div className="battery-chart">
                                        <div className="battery-level critical" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="power-distribution">
                                <h3>🏗️ Power Distribution</h3>
                                <div className="distribution-panel">
                                    <div className="panel-section">
                                        <h4>Main Distribution Board</h4>
                                        <div className="breaker-status">
                                            <div className="breaker online">Phase A: 220V</div>
                                            <div className="breaker online">Phase B: 218V</div>
                                            <div className="breaker online">Phase C: 222V</div>
                                        </div>
                                    </div>
                                    <div className="panel-section">
                                        <h4>Emergency Circuits</h4>
                                        <div className="breaker-status">
                                            <div className="breaker online">ICU: Active</div>
                                            <div className="breaker online">Operating Rooms: Active</div>
                                            <div className="breaker standby">Backup Generator: Standby</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {currentView === 'assets' && (
                        <>
                            <div className="page-header">
                                <h2>📦 Assets Management</h2>
                                <button className="btn btn-primary">+ Add Asset</button>
                            </div>

                            <div className="assets-filters">
                                <div className="filter-group">
                                    <label>Category:</label>
                                    <select>
                                        <option>All</option>
                                        <option>Electrical</option>
                                        <option>Mechanical</option>
                                        <option>HVAC</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Location:</label>
                                    <select>
                                        <option>All</option>
                                        <option>Main Building</option>
                                        <option>Emergency Wing</option>
                                        <option>ICU</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Status:</label>
                                    <select>
                                        <option>All</option>
                                        <option>Operational</option>
                                        <option>Maintenance</option>
                                        <option>Out of Service</option>
                                    </select>
                                </div>
                            </div>

                            <div className="assets-grid">
                                {assetMap.concat([
                                    { id: 3, name: 'Air Conditioning Unit 1', status: 'ok', location: 'Main Building', category: 'HVAC' },
                                    { id: 4, name: 'Elevator Control Panel', status: 'attention', location: 'Emergency Wing', category: 'Electrical' },
                                    { id: 5, name: 'Water Pump Station', status: 'critical', location: 'Basement', category: 'Mechanical' },
                                    { id: 6, name: 'Fire Alarm System', status: 'ok', location: 'All Floors', category: 'Safety' }
                                ]).map(asset => (
                                    <div key={asset.id} className="asset-card">
                                        <div className="asset-header">
                                            <h4>{asset.name}</h4>
                                            <div className={`asset-status ${asset.status === 'ok' ? 'ok' : asset.status === 'attention' ? 'attention' : 'critical'}`}>
                                                {asset.status === 'ok' ? 'OK' : asset.status === 'attention' ? 'Attention' : 'Critical'}
                                            </div>
                                        </div>
                                        <div className="asset-details">
                                            <p><strong>Location:</strong> {asset.location || 'TBD'}</p>
                                            <p><strong>Category:</strong> {asset.category || 'Electrical'}</p>
                                            <p><strong>Last Service:</strong> 15 Oct 2025</p>
                                            <p><strong>Next Service:</strong> 15 Nov 2025</p>
                                        </div>
                                        <div className="asset-actions">
                                            <button className="btn btn-sm btn-outline">View Details</button>
                                            <button className="btn btn-sm btn-outline">Schedule Maintenance</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="asset-map-widget">
                                <h3>📍 Asset Locations</h3>
                                <div className="floor-plan">
                                    <div className="floor-plan-header">Hospital Floor Plan</div>
                                    <div className="floor-plan-content">
                                        <div className="asset-marker" style={{ top: '20%', left: '30%' }} title="Generator 1">⚡</div>
                                        <div className="asset-marker" style={{ top: '40%', left: '60%' }} title="UPS Rack">🔋</div>
                                        <div className="asset-marker" style={{ top: '70%', left: '50%' }} title="AC Unit">❄️</div>
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
                                    <h3>⚡ Power Consumption Report</h3>
                                    <p>Monthly electricity usage analysis</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">This Month:</span>
                                            <span className="metric-value">12,450 kWh</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">vs Last Month:</span>
                                            <span className="metric-value up">+8.2%</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>

                                <div className="report-card">
                                    <h3>🛠️ Maintenance Performance</h3>
                                    <p>Work order completion rates</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Completed:</span>
                                            <span className="metric-value">89%</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">On Time:</span>
                                            <span className="metric-value">76%</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>

                                <div className="report-card">
                                    <h3>⚠️ System Alerts Summary</h3>
                                    <p>Critical alerts and incidents</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Critical:</span>
                                            <span className="metric-value critical">3</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Warnings:</span>
                                            <span className="metric-value warning">12</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>

                                <div className="report-card">
                                    <h3>💰 Cost Analysis</h3>
                                    <p>Maintenance and energy costs</p>
                                    <div className="report-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Monthly Cost:</span>
                                            <span className="metric-value">$8,450</span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Budget Used:</span>
                                            <span className="metric-value">67%</span>
                                        </div>
                                    </div>
                                    <button className="btn btn-outline">View Details</button>
                                </div>
                            </div>

                            <div className="charts-section">
                                <div className="chart-container">
                                    <h3>Energy Usage Trend</h3>
                                    <div className="energy-trend-chart">
                                        <svg viewBox="0 0 400 200">
                                            <polyline points="0,150 50,140 100,130 150,160 200,120 250,110 300,130 350,100 400,90" stroke="#3498db" fill="none" strokeWidth="2"/>
                                        </svg>
                                    </div>
                                </div>

                                <div className="chart-container">
                                    <h3>Equipment Uptime</h3>
                                    <div className="uptime-chart">
                                        <div className="uptime-bar">
                                            <div className="uptime-fill" style={{ width: '96%' }}></div>
                                            <span>96% Uptime</span>
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
                                            Email alerts for critical issues
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <label>
                                            <input type="checkbox" defaultChecked />
                                            SMS alerts for emergency situations
                                        </label>
                                    </div>
                                    <div className="setting-item">
                                        <label>
                                            <input type="checkbox" />
                                            Maintenance reminder notifications
                                        </label>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>📊 Dashboard Preferences</h3>
                                    <div className="setting-item">
                                        <label>Refresh Interval:</label>
                                        <select>
                                            <option>30 seconds</option>
                                            <option>1 minute</option>
                                            <option>5 minutes</option>
                                            <option>15 minutes</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <label>Default View:</label>
                                        <select>
                                            <option>Dashboard</option>
                                            <option>Work Orders</option>
                                            <option>Assets</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>🔧 Maintenance Settings</h3>
                                    <div className="setting-item">
                                        <label>Auto-assign work orders:</label>
                                        <select>
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                    </div>
                                    <div className="setting-item">
                                        <label>Default priority:</label>
                                        <select>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>Low</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="settings-section">
                                    <h3>👤 Profile Settings</h3>
                                    <div className="setting-item">
                                        <label>Display Name:</label>
                                        <input type="text" defaultValue="Eng. Ndegwa" />
                                    </div>
                                    <div className="setting-item">
                                        <label>Email:</label>
                                        <input type="email" defaultValue="ndegwa.electrical@hospital.com" />
                                    </div>
                                    <div className="setting-item">
                                        <label>Phone:</label>
                                        <input type="tel" defaultValue="+254 700 123 456" />
                                    </div>
                                </div>

                                <div className="settings-actions">
                                    <button className="btn btn-primary">Save Changes</button>
                                    <button className="btn btn-outline">Reset to Defaults</button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Floating Action Button */}
                    <button className="fab" title="New Work Order">
                        +
                        <span className="fab-label">New Work Order</span>
                    </button>

                    {/* Asset Map Widget */}
                    <div className="asset-map">
                        <h4>📍 Asset Map</h4>
                        {assetMap.map(asset => (
                            <div key={asset.id} className="asset-item">
                                <div className={`asset-indicator ${asset.status === 'ok' ? 'ok' : asset.status === 'attention' ? 'attention' : 'critical'}`}></div>
                                <div className="asset-info">
                                    <div className="asset-name">{asset.name}</div>
                                    <div className="asset-status">{asset.status === 'ok' ? 'OK' : asset.status === 'attention' ? 'Attention' : 'Critical'}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {currentView === 'work-order-details' && selectedWorkOrder && (
                        <Card className="mb-4">
                            <div className="card__header">
                                <h4 className="card__title">{selectedWorkOrder.title}</h4>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setCurrentView('dashboard')}
                                >
                                    Back to Dashboard
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <strong>Status:</strong>
                                    <span className={`status-badge status-${selectedWorkOrder.status} ml-2`}>
                                        {selectedWorkOrder.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div>
                                    <strong>Priority:</strong>
                                    <span className={`status-badge priority-${selectedWorkOrder.priority} ml-2`}>
                                        {selectedWorkOrder.priority}
                                    </span>
                                </div>
                                <div>
                                    <strong>Location:</strong> {selectedWorkOrder.location}
                                </div>
                                <div>
                                    <strong>Category:</strong> {selectedWorkOrder.category}
                                </div>
                                {selectedWorkOrder.equipment_id && (
                                    <div>
                                        <strong>Equipment ID:</strong> {selectedWorkOrder.equipment_id}
                                    </div>
                                )}
                                {selectedWorkOrder.estimated_hours && (
                                    <div>
                                        <strong>Estimated Hours:</strong> {selectedWorkOrder.estimated_hours}
                                    </div>
                                )}
                            </div>

                            <p className="mb-4"><strong>Description:</strong> {selectedWorkOrder.description}</p>

                            {/* Status Update Section */}
                            <div className="mb-4">
                                <h5>Update Status</h5>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-control"
                                            value={statusUpdate.status}
                                            onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="assigned">Assigned</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Actual Hours (optional)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            step="0.5"
                                            value={statusUpdate.actualHours}
                                            onChange={(e) => setStatusUpdate({...statusUpdate, actualHours: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary mt-2"
                                    onClick={updateWorkOrderStatus}
                                    disabled={!statusUpdate.status}
                                >
                                    Update Status
                                </button>
                            </div>

                            {/* Comments Section */}
                            <div className="mb-4">
                                <h5>Comments</h5>
                                <div className="comments-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                                    {comments.length === 0 ? (
                                        <p className="text-muted">No comments yet.</p>
                                    ) : (
                                        comments.map(comment => (
                                            <div key={comment.id} className="comment-item" style={{
                                                padding: '0.5rem',
                                                borderBottom: '1px solid #eee',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong>{comment.user}</strong>
                                                    <small className="text-muted">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </small>
                                                </div>
                                                <p style={{ margin: '0.25rem 0' }}>{comment.comment}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="comment-form">
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-primary btn-sm mt-2"
                                        onClick={addComment}
                                        disabled={!newComment.trim()}
                                    >
                                        Add Comment
                                    </button>
                                </div>
                            </div>

                            {/* Attachments Section */}
                            <div className="mb-4">
                                <h5>Attachments</h5>
                                {attachments.length > 0 && (
                                    <div className="attachments-list mb-3">
                                        {attachments.map(attachment => (
                                            <div key={attachment.id} className="attachment-item" style={{
                                                padding: '0.5rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                marginBottom: '0.5rem'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{attachment.filename}</span>
                                                    <small className="text-muted">
                                                        {(attachment.file_size / 1024).toFixed(1)} KB
                                                    </small>
                                                </div>
                                                <small className="text-muted">
                                                    Uploaded by {attachment.uploaded_by} on {new Date(attachment.uploaded_at).toLocaleString()}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="attachment-upload">
                                    <input
                                        type="file"
                                        className="form-control"
                                        onChange={(e) => setNewAttachment(e.target.files[0])}
                                        accept="image/*,.pdf,.doc,.docx,.txt"
                                    />
                                    <button
                                        className="btn btn-outline btn-sm mt-2"
                                        onClick={uploadAttachment}
                                        disabled={!newAttachment}
                                    >
                                        Upload Attachment
                                    </button>
                                </div>
                            </div>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}