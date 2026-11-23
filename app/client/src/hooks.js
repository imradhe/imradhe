import { useEffect, useState } from 'react';
import { api } from './api';

export function useResource(path) {
  const [state, setState] = useState({ path, loading: true, data: null, error: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ path, loading: true, data: null, error: null });
    api(path, { signal: controller.signal }).then(data => setState({ path, loading: false, data, error: null }))
      .catch(error => { if (error.name !== 'AbortError') setState({ path, loading: false, data: null, error }); });
    return () => controller.abort();
  }, [path, revision]);
  return { ...(state.path === path ? state : { loading: true, data: null, error: null }), reload: () => setRevision(v => v + 1) };
}
export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try { const stored = localStorage.getItem(key); return stored === null ? initial : JSON.parse(stored); } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be full or unavailable. */ } }, [key, value]);
  return [value, setValue];
}
