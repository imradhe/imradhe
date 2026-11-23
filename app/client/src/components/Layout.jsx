import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStoredState } from '../hooks';
import { useAuth } from '../auth';
export default function Layout() {
  const [dark, setDark] = useStoredState('imradhe:dark', false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="site-header"><Link className="brand" to="/">imradhe<span>.com</span></Link>
      <nav aria-label="Main navigation"><NavLink to="/blog">Blog</NavLink><NavLink to="/stories">Stories</NavLink><NavLink to="/ar">AR</NavLink><NavLink to="/dhwani">Dhwani</NavLink>{user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}{user ? <Link to="/logout">Log out</Link> : <Link to="/login">Log in</Link>}</nav>
      <button className="theme secondary" onClick={() => setDark(v => !v)} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>{dark ? 'Light' : 'Dark'}</button>
    </header>
    <main id="main"><Outlet /></main>
    <footer><Link to="/">Radhe Shyam Salopanthula</Link><div className="actions"><Link to="/chess">Chess</Link><Link to="/streak">StreakTracker</Link><Link to="/wav2vec">Speech to text</Link><a href="mailto:contact@imradhe.com">Contact</a></div></footer>
  </>;
}
