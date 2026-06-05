const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    const error = new Error('No pudimos conectar con el servidor. Inténtalo nuevamente.');
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || 'No se pudo completar la solicitud.');
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }

  return data;
}

export function fetchCounter() {
  return apiRequest('/api/counter', { cache: 'no-store' });
}

export function createPayment({ name, email }) {
  return apiRequest('/api/create-payment', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });
}

export function fetchPaymentStatus(paymentId) {
  return apiRequest(`/api/payment-status/${encodeURIComponent(paymentId)}`, {
    cache: 'no-store',
  });
}

export function fetchFounderAccess(paymentId) {
  return apiRequest(`/api/founder-access/${encodeURIComponent(paymentId)}`, {
    cache: 'no-store',
  });
}
