const API_BASE_URL = 'http://localhost:5000';

export const api = {
  get: (endpoint) => fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include'
  }).then(res => res.json()),
  post: (endpoint, data) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  }).then(res => res.json()),
  put: (endpoint, data) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  }).then(res => res.json()),
};