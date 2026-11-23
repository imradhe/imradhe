let csrfToken = '';
export const setCsrf = token => { csrfToken = token || ''; };
// raw: { type, body } sends a non-JSON payload such as a PDF file.
export async function api(path, options = {}) {
  const { body, raw, ...rest } = options;
  const response = await fetch(`/api${path}`, {
    credentials: 'same-origin', ...rest,
    headers: { ...(raw ? { 'Content-Type': raw.type } : body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}), ...options.headers },
    ...(raw ? { body: raw.body } : body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
  if (!response.ok) { const error = new Error(data.message || 'Request failed.'); error.status = response.status; throw error; }
  return data;
}
