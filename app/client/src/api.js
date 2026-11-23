let csrfToken = '';
export const setCsrf = token => { csrfToken = token || ''; };
export async function api(path, options = {}) {
  const { body, ...rest } = options;
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin', ...rest,
    headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}), ...options.headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
  if (!response.ok) { const error = new Error(data.message || 'Request failed.'); error.status = response.status; throw error; }
  return data;
}
