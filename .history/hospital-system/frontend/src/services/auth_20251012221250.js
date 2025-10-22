export const auth = {
  login: (username, password) => {
    return fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(res => res.json());
  },
  logout: () => {
    return fetch('/auth/logout', { method: 'POST' }).then(res => res.json());
  },
};