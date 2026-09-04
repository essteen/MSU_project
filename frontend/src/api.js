export async function apiFetch(url, options = {}) {
  let authHeader = {};
  try {
    const stored = localStorage.getItem('homely.auth');
    const token = stored ? JSON.parse(stored)?.token : null;
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
    }
  } catch {
    // ignore malformed stored auth
  }

  const isFormData = options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };

  const response = await fetch(url, {
    headers: { ...defaultHeaders, ...authHeader, ...(options.headers ?? {}) },
    ...options
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Forespørselen feilet');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
