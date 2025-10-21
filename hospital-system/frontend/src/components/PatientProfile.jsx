import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './PatientProfile.css';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/patient/profile');
      setProfile(data);
      setFormData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
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
    try {
      await api.put('/patient/profile', formData);
      setProfile(formData);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="error">Profile not found</div>;
  }

  return (
    <div className="patient-profile">
      <div className="profile-header">
        <h2>My Profile</h2>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn btn-primary">
            ✏️ Edit Profile
          </button>
        ) : (
          <div className="edit-buttons">
            <button onClick={handleSubmit} className="btn btn-success">
              ✓ Save Changes
            </button>
            <button onClick={handleCancel} className="btn btn-secondary">
              ✕ Cancel
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="profile-section">
          <h3>📋 Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              {editing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <div className="form-value">{profile.name}</div>
              )}
            </div>

            <div className="form-group">
              <label>Age</label>
              {editing ? (
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  required
                />
              ) : (
                <div className="form-value">{profile.age} years</div>
              )}
            </div>

            <div className="form-group">
              <label>Gender</label>
              {editing ? (
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <div className="form-value">{profile.gender || 'Not specified'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              {editing ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">
                  {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not specified'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="profile-section">
          <h3>📞 Contact Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Phone</label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  placeholder="+254712345678"
                />
              ) : (
                <div className="form-value">{profile.phone || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                />
              ) : (
                <div className="form-value">{profile.email || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Address</label>
              {editing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  placeholder="Street address"
                />
              ) : (
                <div className="form-value">{profile.address || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>City</label>
              {editing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">{profile.city || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>State/County</label>
              {editing ? (
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">{profile.state || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              {editing ? (
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">{profile.zip_code || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="profile-section">
          <h3>🚨 Emergency Contact</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name</label>
              {editing ? (
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">{profile.emergency_contact_name || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              {editing ? (
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">{profile.emergency_contact_phone || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Relationship</label>
              {editing ? (
                <input
                  type="text"
                  name="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              ) : (
                <div className="form-value">{profile.emergency_contact_relationship || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="profile-section">
          <h3>🏥 Medical Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Blood Type</label>
              {editing ? (
                <select
                  name="blood_type"
                  value={formData.blood_type || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select Blood Type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <div className="form-value blood-type">{profile.blood_type || 'Not specified'}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Allergies</label>
              {editing ? (
                <textarea
                  name="allergies"
                  value={formData.allergies || ''}
                  onChange={handleInputChange}
                  placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                  rows="2"
                />
              ) : (
                <div className="form-value">{profile.allergies || 'None reported'}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Chronic Conditions</label>
              {editing ? (
                <textarea
                  name="chronic_conditions"
                  value={formData.chronic_conditions || ''}
                  onChange={handleInputChange}
                  placeholder="List any chronic conditions"
                  rows="2"
                />
              ) : (
                <div className="form-value">{profile.chronic_conditions || 'None reported'}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Current Medications</label>
              {editing ? (
                <textarea
                  name="current_medications"
                  value={formData.current_medications || ''}
                  onChange={handleInputChange}
                  placeholder="List current medications and dosages"
                  rows="2"
                />
              ) : (
                <div className="form-value">{profile.current_medications || 'None'}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label>Current Condition</label>
              {editing ? (
                <textarea
                  name="condition"
                  value={formData.condition || ''}
                  onChange={handleInputChange}
                  placeholder="Current medical condition or reason for visit"
                  rows="2"
                />
              ) : (
                <div className="form-value">{profile.condition || 'Not specified'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="profile-section">
          <h3>🛡️ Insurance Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Insurance Provider</label>
              {editing ? (
                <input
                  type="text"
                  name="insurance_provider"
                  value={formData.insurance_provider || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., AAR Insurance"
                />
              ) : (
                <div className="form-value">{profile.insurance_provider || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Policy Number</label>
              {editing ? (
                <input
                  type="text"
                  name="insurance_policy_number"
                  value={formData.insurance_policy_number || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">{profile.insurance_policy_number || 'Not provided'}</div>
              )}
            </div>

            <div className="form-group">
              <label>Group Number</label>
              {editing ? (
                <input
                  type="text"
                  name="insurance_group_number"
                  value={formData.insurance_group_number || ''}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="form-value">{profile.insurance_group_number || 'Not provided'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Administrative Information */}
        {(profile.admission_date || profile.discharge_date) && (
          <div className="profile-section">
            <h3>📅 Administrative Information</h3>
            <div className="form-grid">
              {profile.admission_date && (
                <div className="form-group">
                  <label>Admission Date</label>
                  <div className="form-value">
                    {new Date(profile.admission_date).toLocaleDateString()}
                  </div>
                </div>
              )}
              {profile.discharge_date && (
                <div className="form-group">
                  <label>Discharge Date</label>
                  <div className="form-value">
                    {new Date(profile.discharge_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default PatientProfile;