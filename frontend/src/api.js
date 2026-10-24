const API_BASE = '/api';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
});

const handleResponse = async (res) => {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || 'Something went wrong');
  }
  return data;
};

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (full_name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password }),
    });
    return handleResponse(res);
  },

  getVehicles: async () => {
    const res = await fetch(`${API_BASE}/vehicles`, { headers: getHeaders() });
    return handleResponse(res);
  },

  searchVehicles: async (params) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/vehicles/search?${query}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createVehicle: async (vehicle) => {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(vehicle),
    });
    return handleResponse(res);
  },

  updateVehicle: async (id, vehicle) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(vehicle),
    });
    return handleResponse(res);
  },

  deleteVehicle: async (id) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  purchaseVehicle: async (id) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}/purchase`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  restockVehicle: async (id, amount) => {
    const res = await fetch(`${API_BASE}/vehicles/${id}/restock`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount: Number(amount) }),
    });
    return handleResponse(res);
  },

  getOrderHistory: async () => {
    const res = await fetch(`${API_BASE}/vehicles/orders/history`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  deleteOrder: async (orderId) => {
    const res = await fetch(`${API_BASE}/vehicles/orders/${orderId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  clearOrders: async () => {
    const res = await fetch(`${API_BASE}/vehicles/orders`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};