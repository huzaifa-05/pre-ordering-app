/**
 * src/services/api.js
 * Centralised API layer for Pre-Ordering App
 */

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/** Build headers with optional or stored JWT token */
const headers = (token = null) => {
  const authToken = token || localStorage.getItem('token');
  const h = { 'Content-Type': 'application/json' };
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  return h;
};

/** Generic error extractor */
const extractError = async (res) => {
  try {
    const body = await res.json();
    return body.error || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
};

// ── Auth Services ───────────────────────────────────────────────
export const login = async (credentials) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  if (json.token) {
    localStorage.setItem('token', json.token);
    localStorage.setItem('user', JSON.stringify(json.user));
  }
  return json;
};

export const signup = async (userData) => {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  if (json.token) {
    localStorage.setItem('token', json.token);
    localStorage.setItem('user', JSON.stringify(json.user));
  }
  return json;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const res = await fetch(`${API_URL}/auth/me`, { headers: headers(token) });
  if (!res.ok) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
  const json = await res.json();
  return json.user;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ── Menu ─────────────────────────────────────────────────────────
export const getMenu = async () => {
  const res = await fetch(`${API_URL}/menu`, { headers: headers() });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  return (json.data || []).map((item) => ({
    ...item,
    price: parseFloat(item.price),
  }));
};

// ── Orders ────────────────────────────────────────────────────────
export const createOrder = async (orderData) => {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  return json.data;
};

export const getOrders = async () => {
  const res = await fetch(`${API_URL}/orders`, { headers: headers() });
  if (!res.ok) throw new Error(await extractError(res));
  const json = await res.json();
  return json.data;
};
