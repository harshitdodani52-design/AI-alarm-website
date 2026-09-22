const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// In-memory token storage — not localStorage, since JWTs in localStorage
// are vulnerable to XSS. This means a page refresh logs the user out;
// swap for an httpOnly cookie set by the backend if you want persistence.
let authToken = null

export function setToken(token) {
  authToken = token
}

export function getToken() {
  return authToken
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = res.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`
    throw new Error(message)
  }

  return data
}

export const api = {
  signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload, auth: false }),

  getAlarms: () => request('/api/alarms'),
  createAlarm: (payload) => request('/api/alarms', { method: 'POST', body: payload }),
  updateAlarm: (id, payload) => request(`/api/alarms/${id}`, { method: 'PUT', body: payload }),
  deleteAlarm: (id) => request(`/api/alarms/${id}`, { method: 'DELETE' }),

  validateTask: (payload) => request('/api/tasks/validate', { method: 'POST', body: payload }),
  saveTask: (payload) => request('/api/tasks', { method: 'POST', body: payload }),
  getTasks: () => request('/api/tasks'),
}
