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