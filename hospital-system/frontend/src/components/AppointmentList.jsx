import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AppointmentList.css';

const AppointmentList = ({ patientId, departmentId, showControls = true }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [patientId, departmentId, filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (patientId) params.patient_id = patientId;
      if (departmentId) params.department_id = departmentId;

      const response = await api.get('/appointment/appointments', { params });
      setAppointments(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointment/appointment/${appointmentId}`, {
        status: newStatus
      });
      fetchAppointments(); // Refresh the list
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#17a2b8',
      confirmed: '#28a745',
      in_progress: '#ffc107',
      completed: '#6c757d',
      cancelled: '#dc3545',
      no_show: '#fd7e14'
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#28a745',
      normal: '#17a2b8',
      high: '#ffc107',
      urgent: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  };

  const formatDateTime = (date, time) => {
    const dateTime = new Date(`${date}T${time}`);
    return dateTime.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="appointment-list">
      <div className="list-header">
        <h3>Appointments</h3>
        {showControls && (
          <div className="filters">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            <input
              type="date"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
              placeholder="From Date"
            />
            <input
              type="date"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
              placeholder="To Date"
            />
          </div>
        )}
      </div>

      {appointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div className="appointment-type">
                  <span className={`type-badge type-${appointment.appointment_type}`}>
                    {appointment.appointment_type}
                  </span>
                </div>
                <div className="appointment-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>

              <div className="appointment-details">
                <div className="detail-row">
                  <strong>Patient:</strong> {appointment.patient_name}
                </div>
                <div className="detail-row">
                  <strong>Department:</strong> {appointment.department_name}
                </div>
                {appointment.doctor_name && (
                  <div className="detail-row">
                    <strong>Doctor:</strong> {appointment.doctor_name}
                  </div>
                )}
                <div className="detail-row">
                  <strong>Date & Time:</strong>
                  {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                  ({appointment.duration_minutes} min)
                </div>
                <div className="detail-row">
                  <strong>Reason:</strong> {appointment.reason}
                </div>
                {appointment.notes && (
                  <div className="detail-row">
                    <strong>Notes:</strong> {appointment.notes}
                  </div>
                )}
                <div className="detail-row">
                  <strong>Priority:</strong>
                  <span style={{ color: getPriorityColor(appointment.priority) }}>
                    {appointment.priority}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Scheduled by:</strong> {appointment.scheduler_name}
                </div>
                <div className="detail-row">
                  <strong>Created:</strong> {new Date(appointment.created_at).toLocaleDateString()}
                </div>
              </div>

              {showControls && (
                <div className="appointment-actions">
                  {appointment.status === 'scheduled' && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleStatusUpdate(appointment.id, 'in_progress')}
                      >
                        Start
                      </button>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleStatusUpdate(appointment.id, 'in_progress')}
                    >
                      Start
                    </button>
                  )}
                  {appointment.status === 'in_progress' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                    >
                      Complete
                    </button>
                  )}
                  {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  )}
                  {appointment.status === 'scheduled' && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleStatusUpdate(appointment.id, 'no_show')}
                    >
                      No Show
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;