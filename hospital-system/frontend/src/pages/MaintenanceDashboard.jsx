import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { api } from '../services/api';

export default function MaintenanceDashboard() {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [stats, setStats] = useState({
        totalWorkOrders: 0,
        openWorkOrders: 0,
        inProgressWorkOrders: 0,
        completedWorkOrders: 0,
        electricalWorkOrders: 0,
        plumbingWorkOrders: 0,
        hvacWorkOrders: 0
    });
    const [technicians, setTechnicians] = useState([]);
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        fetchData();
        fetchTechnicians();
        fetchDepartments();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch all work orders for maintenance manager
            const workOrdersData = await api.get('/work-order/list');
            setWorkOrders(workOrdersData);

            // Calculate comprehensive stats
            const totalWorkOrders = workOrdersData.length;
            const openWorkOrders = workOrdersData.filter(wo => wo.status === 'open').length;
            const inProgressWorkOrders = workOrdersData.filter(wo => wo.status === 'in_progress' || wo.status === 'assigned').length;
            const completedWorkOrders = workOrdersData.filter(wo => wo.status === 'completed').length;

            // Category breakdown
            const electricalWorkOrders = workOrdersData.filter(wo => wo.category === 'electrical').length;
            const plumbingWorkOrders = workOrdersData.filter(wo => wo.category === 'plumbing').length;
            const hvacWorkOrders = workOrdersData.filter(wo => wo.category === 'hvac').length;

            setStats({
                totalWorkOrders,
                openWorkOrders,
                inProgressWorkOrders,
                completedWorkOrders,
                electricalWorkOrders,
                plumbingWorkOrders,
                hvacWorkOrders
            });

            setLoading(false);
        } catch (err) {
            setError('Failed to fetch work orders');
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const techniciansData = await api.get('/maintenance/technicians');
            setTechnicians(techniciansData);
        } catch (err) {
            console.error('Failed to fetch technicians:', err);
        }
    };

    const fetchDepartments = async () => {
        try {
            // This would need a new endpoint to get maintenance departments
            // For now, we'll use a placeholder
            setDepartments([
                { id: 1, name: 'Electrical', type: 'maintenance' },
                { id: 2, name: 'Plumbing', type: 'maintenance' },
                { id: 3, name: 'HVAC', type: 'maintenance' }
            ]);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        }
    };

    const assignWorkOrder = async (workOrderId, technicianId) => {
        try {
            await api.put(`/work-order/${workOrderId}/assign`, {
                user_id: technicianId
            });
            fetchData(); // Refresh data
        } catch (err) {
            setError('Failed to assign work order');
        }
    };

    const viewWorkOrderDetails = async (workOrder) => {
        setSelectedWorkOrder(workOrder);
        setCurrentView('work-order-details');
    };

    if (loading) {
        return (
            <div className="dashboard">
                <Navbar />
                <div className="content">
                    <Sidebar role="maintenance" />
                    <main>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            Loading maintenance dashboard...
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
                    <Sidebar role="maintenance" />
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
                <Sidebar role="maintenance" activeItem={currentView} onItemClick={setCurrentView} />
                <main>
                    <div className="main-header">
                        <h2>Maintenance Department Dashboard</h2>
                    </div>

                    {currentView === 'dashboard' && (
                        <>
                            {/* Maintenance Manager Stats Dashboard */}
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
                                        <p className="text-sm text-gray-600">Open Orders</p>
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

                            {/* Department Breakdown */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <Card>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-purple-600">{stats.electricalWorkOrders}</h3>
                                        <p className="text-sm text-gray-600">Electrical Orders</p>
                                    </div>
                                </Card>
                                <Card>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-blue-600">{stats.plumbingWorkOrders}</h3>
                                        <p className="text-sm text-gray-600">Plumbing Orders</p>
                                    </div>
                                </Card>
                                <Card>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-teal-600">{stats.hvacWorkOrders}</h3>
                                        <p className="text-sm text-gray-600">HVAC Orders</p>
                                    </div>
                                </Card>
                            </div>

                            <h3 className="mb-4">All Work Orders</h3>
                            {workOrders.length === 0 ? (
                                <Card>
                                    <p className="text-center text-secondary">No work orders found.</p>
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
                                            <div>
                                                <strong>Requester:</strong> {workOrder.requester}
                                            </div>
                                            {workOrder.equipment_id && (
                                                <div>
                                                    <strong>Equipment ID:</strong> {workOrder.equipment_id}
                                                </div>
                                            )}
                                            {workOrder.assigned_to && (
                                                <div>
                                                    <strong>Assigned To:</strong> {workOrder.assigned_to}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <small className="text-muted">
                                                Created: {new Date(workOrder.created_at).toLocaleString()}
                                            </small>
                                            <small className="text-muted">
                                                Priority: {workOrder.priority}
                                            </small>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div>
                                                <span className="text-muted">
                                                    Status: {workOrder.status ? workOrder.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => viewWorkOrderDetails(workOrder)}
                                                >
                                                    View Details
                                                </button>
                                                {workOrder.status === 'open' && (
                                                    <select
                                                        className="form-control form-control-sm"
                                                        onChange={(e) => assignWorkOrder(workOrder.id, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Assign to...</option>
                                                        {technicians.map(tech => (
                                                            <option key={tech.id} value={tech.user_id}>
                                                                {tech.name} ({tech.specialty})
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
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
                                <div>
                                    <strong>Requester:</strong> {selectedWorkOrder.requester}
                                </div>
                                {selectedWorkOrder.assigned_to && (
                                    <div>
                                        <strong>Assigned To:</strong> {selectedWorkOrder.assigned_to}
                                    </div>
                                )}
                            </div>

                            <p className="mb-4"><strong>Description:</strong> {selectedWorkOrder.description}</p>

                            <div className="text-muted">
                                <small>Created: {new Date(selectedWorkOrder.created_at).toLocaleString()}</small>
                            </div>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}