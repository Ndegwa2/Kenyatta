const API_BASE_URL = 'http://localhost:5000';

export const auth = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error occurred');
    }
  },
  
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }
      
      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error occurred');
    }
  },
  
  checkStatus: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { authenticated: false };
    }
  }
};