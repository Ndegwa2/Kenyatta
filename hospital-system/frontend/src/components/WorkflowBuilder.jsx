import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const WorkflowBuilder = ({ workflowId, onClose }) => {
  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    step_type: 'action',
    config: {}
  });

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    } else {
      setLoading(false);
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const data = await api.get(`/workflow/workflows/${workflowId}`);
      setWorkflow(data);
      setSteps(data.steps || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      setLoading(false);
    }
  };

  const handleAddStep = async () => {
    if (!newStep.name.trim()) return;

    try {
      const stepData = {
        name: newStep.name,
        description: newStep.description,
        step_type: newStep.step_type,
        config: newStep.config
      };

      await api.post(`/workflow/workflows/${workflowId}/steps`, stepData);
      setNewStep({ name: '', description: '', step_type: 'action', config: {} });
      fetchWorkflow(); // Refresh
    } catch (error) {
      console.error('Error adding step:', error);
      alert('Failed to add step');
    }
  };

  const getStepTypeColor = (type) => {
    switch (type) {
      case 'trigger': return '#4CAF50';
      case 'condition': return '#FF9800';
      case 'action': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const renderStepConfig = (step) => {
    const config = step.config;

    switch (step.step_type) {
      case 'trigger':
        return (
          <div className="step-config">
            <p><strong>Trigger Type:</strong> {config.trigger_type}</p>
            {config.conditions && (
              <div>
                <strong>Conditions:</strong>
                <ul>
                  {config.conditions.map((cond, idx) => (
                    <li key={idx}>{cond.type}: {cond.value}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'condition':
        return (
          <div className="step-config">
            <p><strong>Condition Type:</strong> {config.condition_type}</p>
            <p><strong>Operator:</strong> {config.operator}</p>
            <p><strong>Value:</strong> {config.value || config.priority || config.status}</p>
          </div>
        );
      case 'action':
        return (
          <div className="step-config">
            <p><strong>Action Type:</strong> {config.action_type}</p>
            {config.user_id && <p><strong>User ID:</strong> {config.user_id}</p>}
            {config.priority && <p><strong>Priority:</strong> {config.priority}</p>}
            {config.hours && <p><strong>Hours:</strong> {config.hours}</p>}
          </div>
        );
      default:
        return <div className="step-config">Unknown step type</div>;
    }
  };

  if (loading) {
    return <div className="workflow-builder">Loading workflow...</div>;
  }

  return (
    <div className="workflow-builder-overlay" onClick={onClose}>
      <div className="workflow-builder-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{workflow ? `Edit Workflow: ${workflow.name}` : 'Create New Workflow'}</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>

        <div className="modal-body">
          {/* Workflow Steps Visualization */}
          <div className="workflow-steps">
            <h3>Workflow Steps</h3>
            <div className="steps-container">
              {steps.length === 0 ? (
                <p className="no-steps">No steps defined yet</p>
              ) : (
                steps.map((step, index) => (
                  <div key={step.id} className="workflow-step">
                    <div
                      className="step-header"
                      style={{ backgroundColor: getStepTypeColor(step.step_type) }}
                    >
                      <span className="step-order">{step.step_order}</span>
                      <span className="step-type">{step.step_type}</span>
                    </div>
                    <div className="step-content">
                      <h4>{step.name}</h4>
                      <p>{step.description}</p>
                      {renderStepConfig(step)}
                    </div>
                    {step.next_step_id && <div className="step-connector">↓</div>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add New Step */}
          {workflowId && (
            <div className="add-step-section">
              <h3>Add New Step</h3>
              <div className="add-step-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Step name"
                    value={newStep.name}
                    onChange={(e) => setNewStep({...newStep, name: e.target.value})}
                  />
                  <select
                    value={newStep.step_type}
                    onChange={(e) => setNewStep({...newStep, step_type: e.target.value})}
                  >
                    <option value="trigger">Trigger</option>
                    <option value="condition">Condition</option>
                    <option value="action">Action</option>
                  </select>
                </div>
                <textarea
                  placeholder="Step description"
                  value={newStep.description}
                  onChange={(e) => setNewStep({...newStep, description: e.target.value})}
                  rows="2"
                />
                <button onClick={handleAddStep} className="btn btn-primary">
                  Add Step
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;