import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { api } from '../api';
import { PageTitle } from '../components/Common';
export function AuthForm({ register = false }) {
  const { user, accept } = useAuth(); const navigate = useNavigate(); const [params] = useSearchParams();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const rawNext = params.get('next') || '/admin';
  const next = /^\/(?!\/)/.test(rawNext) && !rawNext.includes('\\') ? rawNext : '/admin';
  if (user) return <Navigate to={user.role === 'admin' ? next : '/'} replace/>;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const body = Object.fromEntries(new FormData(event.currentTarget));
    try { const data = await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body }); accept(data); navigate(data.user.role === 'admin' ? next : '/', { replace: true }); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <div className="auth card"><PageTitle title={register ? 'Create account' : 'Log in'}/><h1>{register ? 'Create account' : 'Welcome back'}</h1><form onSubmit={submit}>{register && <label>Name<input name="name" autoComplete="name" minLength={2} maxLength={100} required/></label>}<label>Email<input type="email" name="email" autoComplete="email" required maxLength={254}/></label><label>Password<input type="password" name="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 12 : 1} maxLength={256} required/></label>{register && <p className="muted">Use at least 12 characters.</p>}{error && <p role="alert" className="error">{error}</p>}<button disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Log in'}</button></form><p>{register ? 'Already have an account?' : 'Need an account?'} <Link to={register ? '/login' : '/register'}>{register ? 'Log in' : 'Register'}</Link></p></div>;
}
export function Logout() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState('');
  if (!user) return <Navigate to="/login" replace/>;
  return <div className="auth card"><h1>Log out</h1><p>You’re signed in as {user.email}.</p>{error && <p role="alert">{error}</p>}<button onClick={async () => { try { await logout(); navigate('/login'); } catch (e) { setError(e.message); } }}>Log out</button></div>;
}
