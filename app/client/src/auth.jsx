import { Fragment, createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, setCsrf } from './api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  function accept(data) { setCsrf(data.csrf); setUser(data.user); }
  useEffect(() => { api('/auth/me').then(accept).catch(() => {}).finally(() => setLoading(false)); }, []);
  async function logout() { await api('/auth/logout', { method: 'POST', body: {} }); setCsrf(''); setUser(null); }
  return <AuthContext.Provider value={{ user, loading, accept, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  if (user.role !== 'admin') return <div className="notice" role="alert">Administrator access required. Ask the site owner to enable your account.</div>;
  // Remount the screen when the path changes (e.g. editing one record and then another), so editors never keep the previous record's fields.
  return <Fragment key={location.pathname}>{children}</Fragment>;
}
