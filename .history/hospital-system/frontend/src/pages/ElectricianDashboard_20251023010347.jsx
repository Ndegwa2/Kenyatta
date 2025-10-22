import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { api } from '../services/api';

export default function ElectricianDashboard() {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [stats, setStats] = useState({
        totalWorkOrders: 0,
        openWorkOrders: 0,
        inProgressWorkOrders: 0,
        completedWorkOrders: 0
    });
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

            setStats({
                totalWorkOrders,
                openWorkOrders,
                inProgressWorkOrders,
                completedWorkOrders
            });

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
        <div className="dashboard">
            <Navbar />
            <div className="content">
                <Sidebar role="electrician" activeItem={currentView} onItemClick={setCurrentView} />
                <main>
                    <div className="main-header">
                        <h2>Electrician Dashboard</h2>
                    </div>

                    {currentView === 'dashboard' && (
                        <>
                            {/* Electrician Stats Dashboard */}
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                <Card>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-blue-600">{stats.totalWorkOrders}</h3>
                                        <p className="text-sm text-gray-600">Total Work Orders</p>
                                    </div>
                                </Card>
                                <Card>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-orange-600">{stats.openWorkOrders}</h3>
                                        <p className="text-sm text-gray-600">Open/Assigned</p>
                                    </div>
                                </Card>
                                <Card>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-yellow-600">{stats.inProgressWorkOrders}</h3>
                                        <p className="text-sm text-gray-600">In Progress</p>
                                    </div>
                                </Card>
                                <Card>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-green-600">{stats.completedWorkOrders}</h3>
                                        <p className="text-sm text-gray-600">Completed</p>
                                    </div>
                                </Card>
                            </div>

                            <h3 className="mb-4">My Work Orders</h3>
                            {workOrders.length === 0 ? (
                                <Card>
                                    <p className="text-center text-secondary">No work orders assigned yet.</p>
                                </Card>
                            ) : (
                                workOrders.map(workOrder => (
                                    <Card key={workOrder.id} className="mb-4">
                                        <div className="card__header">
                                            <h4 className="card__title">{workOrder.title}</h4>
                                            <div className="flex gap-2">
                                                <span className={`status-badge status-${workOrder.status}`}>{workOrder.status.replace('_', ' ')}</span>
                                                <span className={`status-badge priority-${workOrder.priority}`}>{workOrder.priority}</span>
                                                <span className={`status-badge category-${workOrder.category || 'facilities'}`}>{workOrder.category || 'Facilities'}</span>
                                            </div>
                                        </div>
                                        <p className="mb-4">{workOrder.description}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <strong>Location:</strong> {workOrder.location}
                                            </div>
                                            {workOrder.equipment_id && (
                                                <div>
                                                    <strong>Equipment ID:</strong> {workOrder.equipment_id}
                                                </div>
                                            )}
                                            {workOrder.estimated_hours && (
                                                <div>
                                                    <strong>Estimated Hours:</strong> {workOrder.estimated_hours}
                                                </div>
                                            )}
                                            {workOrder.actual_hours && (
                                                <div>
                                                    <strong>Actual Hours:</strong> {workOrder.actual_hours}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <small className="text-muted">
                                                Requested by: {workOrder.requester}
                                            </small>
                                            <small className="text-muted">
                                                Created: {new Date(workOrder.created_at).toLocaleString()}
                                            </small>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-muted">
                                                    Status: {workOrder.status ? workOrder.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                                </span>
                                            </div>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => viewWorkOrderDetails(workOrder)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </>
                    )}

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