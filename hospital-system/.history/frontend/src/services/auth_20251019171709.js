const API_BASE_URL = 'http://localhost:5000';

export const auth = {
  login: (username, password) => {
    return fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    }).then(res => res.json());
  },
  logout: () => {
    return fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    }).then(res => res.json());
  },
};