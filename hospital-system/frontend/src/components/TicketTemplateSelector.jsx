import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const TicketTemplateSelector = ({ onTemplateSelect, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customData, setCustomData] = useState({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await api.get('/workflow/templates');
      setTemplates(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    // Initialize custom data with template defaults
    const initialData = {};
    if (template.custom_fields) {
      try {
        const fields = typeof template.custom_fields === 'string'
          ? JSON.parse(template.custom_fields)
          : template.custom_fields;
        Object.keys(fields).forEach(key => {
          initialData[key] = fields[key].default || '';
        });
      } catch (error) {
        console.error('Error parsing custom fields in handleTemplateSelect:', error);
      }
    }
    setCustomData(initialData);
  };

  const handleCreateTicket = () => {
    if (!selectedTemplate) return;

    const ticketData = {
      template_id: selectedTemplate.id,
      title: customData.title || selectedTemplate.name,
      description: customData.description || selectedTemplate.description,
      patient_id: customData.patient_id,
      ...customData
    };

    onTemplateSelect(ticketData);
  };

  const renderCustomFields = () => {
    if (!selectedTemplate || !selectedTemplate.custom_fields) return null;

    let fields;
    try {
      fields = typeof selectedTemplate.custom_fields === 'string'
        ? JSON.parse(selectedTemplate.custom_fields)
        : selectedTemplate.custom_fields;
    } catch (error) {
      console.error('Error parsing custom fields:', error);
      return null;
    }

    return Object.entries(fields).map(([key, fieldConfig]) => (
      <div key={key} className="custom-field">
        <label>{fieldConfig.label || key}:</label>
        {fieldConfig.type === 'textarea' ? (
          <textarea
            value={customData[key] || ''}
            onChange={(e) => setCustomData({...customData, [key]: e.target.value})}
            placeholder={fieldConfig.placeholder}
            rows="3"
          />
        ) : fieldConfig.type === 'select' ? (
          <select
            value={customData[key] || ''}
            onChange={(e) => setCustomData({...customData, [key]: e.target.value})}
          >
            <option value="">Select {fieldConfig.label || key}</option>
            {fieldConfig.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={fieldConfig.type || 'text'}
            value={customData[key] || ''}
            onChange={(e) => setCustomData({...customData, [key]: e.target.value})}
            placeholder={fieldConfig.placeholder}
          />
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="template-selector-overlay">
        <div className="template-selector-modal">
          <div className="loading">Loading templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="template-selector-overlay" onClick={onClose}>
      <div className="template-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Ticket Template</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          {!selectedTemplate ? (
            <div className="template-list">
              <h3>Available Templates</h3>
              {templates.length === 0 ? (
                <p className="no-templates">No templates available</p>
              ) : (
                <div className="templates-grid">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className="template-card"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <h4>{template.name}</h4>
                      <p>{template.description}</p>
                      <div className="template-meta">
                        <span className="category">{template.category}</span>
                        <span className="priority">{template.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="template-config">
              <h3>Configure Ticket</h3>
              <div className="selected-template">
                <h4>{selectedTemplate.name}</h4>
                <p>{selectedTemplate.description}</p>
              </div>

              <div className="custom-fields">
                <div className="custom-field">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={customData.title || ''}
                    onChange={(e) => setCustomData({...customData, title: e.target.value})}
                    placeholder="Enter ticket title"
                  />
                </div>

                <div className="custom-field">
                  <label>Description:</label>
                  <textarea
                    value={customData.description || ''}
                    onChange={(e) => setCustomData({...customData, description: e.target.value})}
                    placeholder="Enter ticket description"
                    rows="3"
                  />
                </div>

                <div className="custom-field">
                  <label>Patient ID:</label>
                  <input
                    type="number"
                    value={customData.patient_id || ''}
                    onChange={(e) => setCustomData({...customData, patient_id: parseInt(e.target.value)})}
                    placeholder="Enter patient ID"
                  />
                </div>

                {renderCustomFields()}
              </div>

              <div className="template-actions">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="btn btn-secondary"
                >
                  Back to Templates
                </button>
                <button
                  onClick={handleCreateTicket}
                  className="btn btn-primary"
                  disabled={!customData.patient_id}
                >
                  Create Ticket
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketTemplateSelector;