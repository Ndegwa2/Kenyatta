import React, { useState, useEffect } from "react";
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { api } from '../services/api';

export default function DepartmentDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const [showCreateForm, setShowCreateForm] = useState(false); // No longer needed
    const [currentView, setCurrentView] = useState('dashboard');
   const [templates, setTemplates] = useState([]);
   const [stats, setStats] = useState({
     totalRequests: 0,
     openRequests: 0,
     criticalRequests: 0,
     avgResponseTime: 0
   });
   const [selectedTicket, setSelectedTicket] = useState(null);
   const [comments, setComments] = useState([]);
   const [newComment, setNewComment] = useState('');
   const [showComments, setShowComments] = useState(false);
   const [newTicket, setNewTicket] = useState({
     title: '',
     description: '',
     category: 'general',
     priority: 'medium',
     location_details: '',
     equipment_id: '',
     patient_impact: 'none',
     patients_affected: 1,
     time_sensitivity: 'within_shift'
   });

   useEffect(() => {
     fetchData();
     fetchTemplates();
   }, []);

   const fetchData = async () => {
     try {
       // Fetch department tickets (nurses only see their own submissions)
       const ticketsData = await api.get('/department/tickets');
       setTickets(ticketsData);

       // Calculate stats for nurse dashboard
       const totalRequests = ticketsData.length;
       const openRequests = ticketsData.filter(t => t.status === 'open').length;
       const criticalRequests = ticketsData.filter(t => t.priority === 'critical').length;

       setStats({
         totalRequests,
         openRequests,
         criticalRequests,
         avgResponseTime: 0 // TODO: Calculate from ticket data
       });

       setLoading(false);
     } catch (err) {
       setError('Failed to fetch tickets');
       setLoading(false);
     }
   };

   const fetchTemplates = async () => {
     try {
       const templatesData = await api.get('/department/ticket-templates');
       setTemplates(templatesData);
     } catch (err) {
       console.error('Failed to fetch templates:', err);
     }
   };

   const createTicket = async () => {
     try {
       await api.post('/department/ticket/create', newTicket);
       setCurrentView('dashboard');
       setNewTicket({
         title: '',
         description: '',
         category: 'general',
         priority: 'medium',
         location_details: '',
         equipment_id: '',
         patient_impact: 'none',
         patients_affected: 1,
         time_sensitivity: 'within_shift'
       });
       fetchData();
     } catch (err) {
       setError('Failed to create ticket');
     }
   };

   const loadTemplate = (template) => {
     setNewTicket({
       title: template.title,
       description: template.description,
       category: template.category,
       priority: template.priority,
       location_details: '',
       equipment_id: '',
       patient_impact: template.patient_impact,
       patients_affected: 1,
       time_sensitivity: template.time_sensitivity
     });
     setCurrentView('raise-issue');
   };

   const viewTicketComments = async (ticket) => {
     setSelectedTicket(ticket);
     try {
       const commentsData = await api.get(`/department/ticket/${ticket.id}/comments`);
       setComments(commentsData);
       setShowComments(true);
     } catch (err) {
       console.error('Failed to fetch comments:', err);
     }
   };

   const addComment = async () => {
     if (!newComment.trim() || !selectedTicket) return;

     try {
       await api.post(`/department/ticket/${selectedTicket.id}/comment`, {
         comment: newComment
       });
       setNewComment('');
       // Refresh comments
       const commentsData = await api.get(`/department/ticket/${selectedTicket.id}/comments`);
       setComments(commentsData);
     } catch (err) {
       setError('Failed to add comment');
     }
   };

   if (loading) {
     return (
       <div className="dashboard">
         <Navbar />
         <div className="content">
           <Sidebar role="department" />
           <main>
             <div style={{ textAlign: 'center', padding: '2rem' }}>
               Loading dashboard...
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
           <Sidebar role="department" />
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
         <Sidebar role="department" activeItem={currentView} onItemClick={setCurrentView} />
         <main>
           <div className="main-header">
             <h2>Nursing Department Dashboard</h2>
             {currentView === 'dashboard' && (
               <button
                 className="btn btn-primary"
                 onClick={() => setCurrentView('raise-issue')}
               >
                 Report Maintenance Issue
               </button>
             )}
             {currentView === 'raise-issue' && (
               <button
                 className="btn btn-outline"
                 onClick={() => setCurrentView('dashboard')}
               >
                 Cancel
               </button>
             )}
           </div>

           {currentView === 'dashboard' && (
             <>
               {/* Nurse Stats Dashboard */}
               <div className="grid grid-cols-4 gap-4 mb-4">
                 <Card>
                   <div className="text-center">
                     <h3 className="text-2xl font-bold text-blue-600">{stats.totalRequests}</h3>
                     <p className="text-sm text-gray-600">Total Requests</p>
                   </div>
                 </Card>
                 <Card>
                   <div className="text-center">
                     <h3 className="text-2xl font-bold text-orange-600">{stats.openRequests}</h3>
                     <p className="text-sm text-gray-600">Open Requests</p>
                   </div>
                 </Card>
                 <Card>
                   <div className="text-center">
                     <h3 className="text-2xl font-bold text-red-600">{stats.criticalRequests}</h3>
                     <p className="text-sm text-gray-600">Critical Issues</p>
                   </div>
                 </Card>
                 <Card>
                   <div className="text-center">
                     <h3 className="text-2xl font-bold text-green-600">{stats.avgResponseTime}h</h3>
                     <p className="text-sm text-gray-600">Avg Response Time</p>
                   </div>
                 </Card>
               </div>

               <h3 className="mb-4">My Maintenance Reports</h3>
               {tickets.length === 0 ? (
                 <Card>
                   <p className="text-center text-secondary">No maintenance reports submitted yet.</p>
                 </Card>
               ) : (
                 tickets.map(ticket => (
                   <Card key={ticket.id} className="mb-4">
                     <div className="card__header">
                       <h4 className="card__title">{ticket.title}</h4>
                       <div className="flex gap-2">
                         <span className={`status-badge status-${ticket.status}`}>{ticket.status}</span>
                         <span className={`status-badge priority-${ticket.priority}`}>{ticket.priority}</span>
                         <span className={`status-badge category-${ticket.category || 'general'}`}>{ticket.category ? ticket.category.replace('_', ' ') : 'General'}</span>
                       </div>
                     </div>
                     <p className="mb-4">{ticket.description}</p>

                     {/* Enhanced ticket info */}
                     <div className="grid grid-cols-2 gap-4 mb-4">
                       {ticket.location_details && (
                         <div>
                           <strong>Location:</strong> {ticket.location_details}
                         </div>
                       )}
                       {ticket.equipment_id && (
                         <div>
                           <strong>Equipment ID:</strong> {ticket.equipment_id}
                         </div>
                       )}
                       <div>
                         <strong>Patient Impact:</strong>
                         <span className={`status-badge impact-${ticket.patient_impact} ml-2`}>
                           {ticket.patient_impact}
                         </span>
                       </div>
                       <div>
                         <strong>Time Sensitivity:</strong> {ticket.time_sensitivity ? ticket.time_sensitivity.replace('_', ' ') : 'Not specified'}
                       </div>
                     </div>

                     <div className="flex justify-between items-center mb-4">
                       <small className="text-muted">
                         Submitted: {new Date(ticket.created_at).toLocaleString()}
                       </small>
                       <small className="text-muted">
                         {ticket.assigned_to ? `Assigned to: ${ticket.assigned_to}` : 'Not yet assigned'}
                       </small>
                     </div>

                     {/* Read-only status and comment functionality */}
                     <div className="flex justify-between items-center">
                       <div>
                         <span className="text-muted">
                           Status: {ticket.status.replace('_', ' ').toUpperCase()}
                           {ticket.status === 'closed' && ticket.resolved_at && (
                             <span className="ml-2">
                               (Resolved: {new Date(ticket.resolved_at).toLocaleString()})
                             </span>
                           )}
                         </span>
                       </div>
                       <button
                         className="btn btn-outline btn-sm"
                         onClick={() => viewTicketComments(ticket)}
                       >
                         💬 Comments
                       </button>
                     </div>
                   </Card>
                 ))
               )}
             </>
           )}

           {currentView === 'raise-issue' && (
             <Card className="mb-4">
               <h4>Report Maintenance Issue</h4>

               {/* Quick Templates */}
               <div className="mb-4">
                 <h5>Quick Report Templates:</h5>
                 <div className="flex flex-wrap gap-2">
                   {templates.map(template => (
                     <button
                       key={template.id}
                       className="btn btn-outline btn-sm"
                       onClick={() => loadTemplate(template)}
                     >
                       {template.title}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="form-label">Issue Title</label>
                   <input
                     type="text"
                     className="form-control"
                     value={newTicket.title}
                     onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="form-label">Category</label>
                   <select
                     className="form-control"
                     value={newTicket.category}
                     onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                   >
                     <option value="general">General</option>
                     <option value="medical_equipment">Medical Equipment</option>
                     <option value="hygiene_facilities">Hygiene Facilities</option>
                     <option value="patient_room_facilities">Patient Room Facilities</option>
                     <option value="emergency_equipment">Emergency Equipment</option>
                   </select>
                 </div>
                 <div>
                   <label className="form-label">Location Details</label>
                   <input
                     type="text"
                     className="form-control"
                     placeholder="e.g., Room 205, ICU Ward A"
                     value={newTicket.location_details}
                     onChange={(e) => setNewTicket({...newTicket, location_details: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="form-label">Equipment ID</label>
                   <input
                     type="text"
                     className="form-control"
                     placeholder="Serial number or equipment identifier"
                     value={newTicket.equipment_id}
                     onChange={(e) => setNewTicket({...newTicket, equipment_id: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="form-label">Patient Impact</label>
                   <select
                     className="form-control"
                     value={newTicket.patient_impact}
                     onChange={(e) => setNewTicket({...newTicket, patient_impact: e.target.value})}
                   >
                     <option value="none">None</option>
                     <option value="minor">Minor</option>
                     <option value="moderate">Moderate</option>
                     <option value="severe">Severe</option>
                     <option value="critical">Critical</option>
                   </select>
                 </div>
                 <div>
                   <label className="form-label">Time Sensitivity</label>
                   <select
                     className="form-control"
                     value={newTicket.time_sensitivity}
                     onChange={(e) => setNewTicket({...newTicket, time_sensitivity: e.target.value})}
                   >
                     <option value="within_shift">Within Shift</option>
                     <option value="within_hour">Within Hour</option>
                     <option value="within_day">Within Day</option>
                     <option value="immediate">Immediate</option>
                   </select>
                 </div>
               </div>
               <div className="mt-4">
                 <label className="form-label">Description</label>
                 <textarea
                   className="form-control"
                   rows="3"
                   value={newTicket.description}
                   onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                 />
               </div>
               <div className="flex gap-2 mt-4">
                 <button className="btn btn-primary" onClick={createTicket}>Submit Report</button>
                 <button className="btn btn-outline" onClick={() => setCurrentView('dashboard')}>Cancel</button>
               </div>
             </Card>
           )}

           {/* Comments Modal */}
           {showComments && selectedTicket && (
             <div className="modal-overlay" onClick={() => setShowComments(false)}>
               <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 <div className="modal-header">
                   <h4>Comments for: {selectedTicket.title}</h4>
                   <button
                     className="modal-close"
                     onClick={() => setShowComments(false)}
                   >
                     ×
                   </button>
                 </div>
                 <div className="modal-body">
                   <div className="comments-list" style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
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
                     <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                       <button
                         className="btn btn-primary btn-sm"
                         onClick={addComment}
                         disabled={!newComment.trim()}
                       >
                         Add Comment
                       </button>
                       <button
                         className="btn btn-outline btn-sm"
                         onClick={() => setShowComments(false)}
                       >
                         Close
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}
         </main>
       </div>
     </div>
   );
}