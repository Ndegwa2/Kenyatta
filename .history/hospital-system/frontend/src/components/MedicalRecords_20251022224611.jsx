import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './MedicalRecords.css';

const MedicalRecords = ({ patientId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    visit_type: '',
    date_from: '',
    date_to: ''
  });
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [patientId, filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (patientId) params.patient_id = patientId;

      const response = await api.get('/medical-records/patient/' + patientId + '/records', { params });
      setRecords(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch medical records');
      console.error('Error fetching medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatVitalSigns = (vitals) => {
    if (!vitals) return 'Not recorded';
    const parts = [];
    if (vitals.blood_pressure) parts.push(`BP: ${vitals.blood_pressure}`);
    if (vitals.heart_rate) parts.push(`HR: ${vitals.heart_rate} bpm`);
    if (vitals.temperature) parts.push(`Temp: ${vitals.temperature}°C`);
    if (vitals.weight) parts.push(`Weight: ${vitals.weight} kg`);
    if (vitals.height) parts.push(`Height: ${vitals.height} cm`);
    if (vitals.bmi) parts.push(`BMI: ${vitals.bmi}`);
    return parts.length > 0 ? parts.join(', ') : 'Not recorded';
  };

  if (loading) {
    return <div className="loading">Loading medical records...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="medical-records">
      <div className="records-header">
        <h3>Medical Records</h3>
        <div className="filters">
          <select
            name="visit_type"
            value={filters.visit_type}
            onChange={handleFilterChange}
          >
            <option value="">All Visit Types</option>
            <option value="consultation">Consultation</option>
            <option value="emergency">Emergency</option>
            <option value="follow-up">Follow-up</option>
            <option value="procedure">Procedure</option>
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
      </div>

      {records.length === 0 ? (
        <div className="no-records">
          <p>No medical records found.</p>
        </div>
      ) : (
        <div className="records-list">
          {records.map(record => (
            <div key={record.id} className="record-card">
              <div className="record-header">
                <div className="record-type">
                  <span className={`type-badge type-${record.visit_type}`}>
                    {record.visit_type}
                  </span>
                </div>
                <div className="record-date">
                  {formatDate(record.visit_date)}
                </div>
              </div>

              <div className="record-content">
                <div className="record-section">
                  <h4>Visit Details</h4>
                  <div className="detail-row">
                    <strong>Doctor:</strong> {record.doctor_name || 'Not specified'}
                  </div>
                  <div className="detail-row">
                    <strong>Department:</strong> {record.department_name || 'Not specified'}
                  </div>
                  <div className="detail-row">
                    <strong>Chief Complaint:</strong> {record.chief_complaint}
                  </div>
                  {record.diagnosis && (
                    <div className="detail-row">
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </div>
                  )}
                  {record.treatment && (
                    <div className="detail-row">
                      <strong>Treatment:</strong> {record.treatment}
                    </div>
                  )}
                </div>

                <div className="record-section">
                  <h4>Vital Signs</h4>
                  <div className="vitals-display">
                    {formatVitalSigns(record.vital_signs)}
                  </div>
                </div>

                {record.lab_results && (
                  <div className="record-section">
                    <h4>Lab Results</h4>
                    <div className="lab-results">
                      {Array.isArray(record.lab_results) ? (
                        <ul>
                          {record.lab_results.map((result, index) => (
                            <li key={index}>
                              <strong>{result.test}:</strong> {result.value} {result.unit}
                              {result.reference && <span> (Ref: {result.reference})</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <pre>{JSON.stringify(record.lab_results, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                )}

                {record.prescriptions && (
                  <div className="record-section">
                    <h4>Prescriptions</h4>
                    <div className="prescriptions">
                      {Array.isArray(record.prescriptions) ? (
                        <ul>
                          {record.prescriptions.map((prescription, index) => (
                            <li key={index}>
                              <strong>{prescription.medication}:</strong> {prescription.dosage}
                              {prescription.frequency && <span> ({prescription.frequency})</span>}
                              {prescription.duration && <span> for {prescription.duration}</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <pre>{JSON.stringify(record.prescriptions, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                )}

                {record.notes && (
                  <div className="record-section">
                    <h4>Notes</h4>
                    <p>{record.notes}</p>
                  </div>
                )}

                {record.follow_up_instructions && (
                  <div className="record-section">
                    <h4>Follow-up Instructions</h4>
                    <p>{record.follow_up_instructions}</p>
                  </div>
                )}

                <div className="record-footer">
                  <small className="text-muted">
                    Created by: {record.created_by} on {formatDate(record.created_at)}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;