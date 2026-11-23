import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { api } from '../api';
import useOriginalPage from '../original/useOriginalPage';
import loginCss from '../original/styles/login.css?raw';
import registerCss from '../original/styles/register.css?raw';
// Where to go after signing in: a safe same-site ?next= path wins; with none, admins land on
// /admin and everyone else on the home page. Rejects //host and backslash tricks (open redirect).
export function afterLoginPath(rawNext, role) {
  const safe = typeof rawNext === 'string' && /^\/(?!\/)/.test(rawNext) && !rawNext.includes('\\') ? rawNext : null;
  return safe || (role === 'admin' ? '/admin' : '/');
}
export function AuthForm({ register = false }) {
  const { user, accept } = useAuth(); const navigate = useNavigate(); const [params] = useSearchParams();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '' }); const [touched, setTouched] = useState({});
  useOriginalPage({ css: register ? registerCss : loginCss, bodyClass: 'text-center', title: register ? 'User Registration | GraphenePHP' : 'Login | GraphenePHP', cssBeforeStyles: register });
  if (user) return <Navigate to={afterLoginPath(params.get('next'), user.role)} replace/>;
  function validate(name, value) {
    if (name === 'name') return !value ? "Name can't be empty" : value.length <= 5 ? "Name can't be less than 6 Characters" : '';
    if (name === 'email') return !value.trim() ? "Email can't be empty" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Email is invalid' : '';
    if (name === 'phone') return !value.trim() ? "Mobile number can't be empty" : !/^[6-9][0-9]{9}$/.test(value) ? 'Mobile number is invalid (10 digits only)' : '';
    if (value.length <= 5) return 'Password must be atleast 6 charecters';
    if (!/[a-z]/i.test(value)) return 'Must contain atleast one lowercase alphabet';
    if (!/[0-9]/.test(value)) return 'Must contain atleast one number';
    if (!/\W|_/.test(value)) return 'Must contain atleast one special character';
    if (!/[A-Z]/.test(value)) return 'Must contain atleast one uppercase alphabet';
    return '';
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { const data = await api(`/auth/${register ? 'register' : 'login'}`, { method: 'POST', body: values }); accept(data); navigate(afterLoginPath(params.get('next'), data.user?.role), { replace: true }); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function input(name, placeholder, type = name) {
    const message = touched[name] ? validate(name, values[name]) : '';
    return <div className="mb-3"><input name={name} type={type} id={name} className={`form-control${touched[name] ? message ? ' is-invalid' : ' is-valid' : ''}`} placeholder={placeholder} required value={values[name]} onChange={event => { setValues(v => ({ ...v, [name]: event.target.value })); setTouched(t => ({ ...t, [name]: true })); }} onBlur={() => setTouched(t => ({ ...t, [name]: true }))}/><strong id={`${name}Msg`} className="text-danger errorMsg my-2 fw-bolder">{message}</strong></div>;
  }
  const disabled = busy || ['email', 'password', ...(register ? ['name'] : [])].some(key => validate(key, values[key]));
  return <><div className="logo mt-5 pt-5"><Link to="/"><img src="/assets/img/imradhe.jpg" alt={register ? 'GraphenePHP' : 'graphene'} className="img-fluid"/></Link></div><form method="POST" name={register ? 'Register' : 'Login'} className="form-signin" onSubmit={submit}><h2 className="mb-3 fw-bolder">{register ? 'User Registration ' : 'Log In'}</h2>{params.get('loggedout') && <div className="alert alert-success" role="alert">Logged Out Successfully</div>}{error && <div className="alert alert-danger" role="alert">{error}</div>}{register && input('name', 'Name')}{input('email', 'Email')}{register && input('phone', 'phone')}<div className="text-end"><span className="text-graphene user-select-none" id="eye" onClick={() => setShowPassword(!showPassword)}><i className={`bi bi-eye${showPassword ? '-slash' : ''}-fill`}/>{showPassword ? ' Hide Password' : ' Show Password'}</span></div>{input('password', 'Password', showPassword ? 'text' : 'password')}<button className={`btn btn-lg ${register ? '' : 'btn '}btn-graphene btn-block`} id={register ? 'btn-register' : 'btn-login'} name={register ? 'btn-register' : 'btn-login'} type="submit" disabled={!!disabled}>{register ? 'Register' : 'Sign in'}</button><p className="mt-3">{register ? 'Already Have an account? ' : "Don't Have an account? "}<Link to={register ? '/login' : '/register'}>{register ? 'Login Now' : 'Register Now'}</Link></p></form></>;
}
export function Logout() {
  const { user, loading, logout } = useAuth(); const [error, setError] = useState(''); const navigate = useNavigate();
  useOriginalPage({ title: 'Logout' });
  // The original logout route immediately returned to the login page.
  useEffect(() => { if (!loading && user) logout().then(() => navigate('/login?loggedout=true', { replace: true })).catch(e => setError(e.message)); }, [loading, user]);
  if (!loading && !user) return <Navigate to="/login?loggedout=true" replace/>;
  return error ? <div className="alert alert-danger" role="alert">{error}</div> : null;
}
