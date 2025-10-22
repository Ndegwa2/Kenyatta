import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AppointmentScheduler.css';

const AppointmentScheduler = ({ patientId, departmentId, onAppointmentCreated }) => {
  const [formData, setFormData] = useState({
    appointment_date: '',
    appointment_time: '',
    appointment_type: 'consultation',
    reason: '',
    notes: '',
    priority: 'normal',
    duration_minutes: 30
  });
  const [departments, setDepartments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.appointment_date && formData.department_id) {
      fetchAvailableSlots();
    }
  }, [formData.appointment_date, formData.department_id]);

  const fetchDepartments = async () => {
    try {
      // Try admin endpoint first, fallback to appointment endpoint if not admin
      let response;
      try {
        response = await api.get('/admin/departments');
      } catch (adminErr) {
        // If admin endpoint fails (403), try patient/department endpoint
        response = await api.get('/appointment/departments');
      }
      setDepartments(response);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('/appointment/appointments/availability', {
        params: {
          date: formData.appointment_date,
          department_id: formData.department_id
        }
      });
      setAvailableSlots(response.available_slots || []);
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
      setAvailableSlots([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const appointmentData = {
        ...formData,
        patient_id: patientId,
        department_id: departmentId || formData.department_id
      };

      await api.post('/appointment/appointment', appointmentData);
      setSuccess('Appointment scheduled successfully!');

      // Reset form
      setFormData({
        appointment_date: '',
        appointment_time: '',
        appointment_type: 'consultation',
        reason: '',
        notes: '',
        priority: 'normal',
        duration_minutes: 30
      });

      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="appointment-scheduler">
      <h3>Schedule New Appointment</h3>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="appointment_date">Date *</label>
            <input
              type="date"
              id="appointment_date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleInputChange}
              min={today}
              required
            />
          </div>

          {!departmentId && (
            <div className="form-group">
              <label htmlFor="department_id">Department *</label>
              <select
                id="department_id"
                name="department_id"
                value={formData.department_id || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="appointment_time">Time *</label>
            <select
              id="appointment_time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleInputChange}
              required
              disabled={!formData.appointment_date || (!departmentId && !formData.department_id)}
            >
              <option value="">Select Time</option>
              {availableSlots.map(slot => (
                <option key={slot} value={slot}>
                  {new Date(`2000-01-01T${slot}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="duration_minutes">Duration (minutes)</label>
            <select
              id="duration_minutes"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleInputChange}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="appointment_type">Appointment Type *</label>
            <select
              id="appointment_type"
              name="appointment_type"
              value={formData.appointment_type}
              onChange={handleInputChange}
              required
            >
              <option value="consultation">Consultation</option>
              <option value="follow-up">Follow-up</option>
              <option value="procedure">Procedure</option>
              <option value="therapy">Therapy</option>
              <option value="check-up">Check-up</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="reason">Reason for Appointment *</label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            placeholder="Please describe the reason for this appointment..."
            rows={3}
            required
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="notes">Additional Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes or special requirements..."
            rows={2}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentScheduler;