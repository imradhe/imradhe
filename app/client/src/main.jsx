import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, AdminOnly } from './auth';
import Layout from './components/Layout';
import Portfolio from './pages/Portfolio';
import { BlogIndex, BlogPost, Stories, Story, Scene } from './pages/Reading';
import { AuthForm, Logout } from './pages/Auth';
import { AdminHome, AdminList, AdminEditor, LegacyDelete, AdminFlags } from './pages/Admin';
import { SpeechToText, SpeechDemo, Call, ArchivedChat, MarkerDemo } from './pages/Experiments';
import FormDemo from './pages/FormDemo';
import './styles.css';
const AR = lazy(() => import('./pages/AR'));
const Chess = lazy(() => import('./pages/Chess'));
const Streak = lazy(() => import('./pages/Streak'));
const Dhwani = lazy(() => import('./pages/Dhwani'));
class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main><h1>Something went wrong</h1><p>Reload this page to try again.</p><button onClick={() => location.reload()}>Reload</button></main> : this.props.children; }
}
function NotFound() { return <><h1>Page not found</h1><p>The page you’re looking for doesn’t exist.</p><Link to="/">Back home</Link></>; }
createRoot(document.getElementById('root')).render(<React.StrictMode><ErrorBoundary><BrowserRouter><AuthProvider><Suspense fallback={<p role="status">Loading…</p>}><Routes><Route element={<Layout/>}>
  {['/', '/education', '/skills', '/projects', '/experience', '/interests'].map(path => <Route key={path} path={path} element={<Portfolio/>}/>)}
  <Route path="blog" element={<BlogIndex/>}/><Route path="blog/:slug" element={<BlogPost/>}/>
  <Route path="stories" element={<Stories/>}/><Route path="stories/:slug" element={<Story/>}/><Route path="scene/:slug" element={<Scene/>}/>
  <Route path="login" element={<AuthForm/>}/><Route path="register" element={<AuthForm register/>}/><Route path="logout" element={<Logout/>}/>
  <Route path="ar" element={<AR/>}/><Route path="ar/test" element={<FormDemo/>}/><Route path="ar/video" element={<MarkerDemo/>}/><Route path="ar/:model" element={<AR/>}/>
  <Route path="test" element={<MarkerDemo/>}/><Route path="testmail" element={<p>The legacy mail test route is retired.</p>}/>
  <Route path="call" element={<Call/>}/><Route path="chess" element={<Chess/>}/><Route path="balloon" element={<SpeechDemo/>}/><Route path="wav2vec" element={<SpeechToText/>}/><Route path="deepseek-or-deepfake" element={<ArchivedChat/>}/>
  <Route path="streak" element={<Streak key="session"/>}/><Route path="streak/new" element={<Streak key="daily"/>}/><Route path="dhwani" element={<Dhwani/>}/>
  <Route path="admin" element={<AdminOnly><AdminHome/></AdminOnly>}/>
  {['stories', 'scenes', 'posts'].flatMap(type => [
    <Route key={type} path={`admin/${type}`} element={<AdminOnly><AdminList type={type}/></AdminOnly>}/>,
    <Route key={`${type}-new`} path={`admin/${type}/new`} element={<AdminOnly><AdminEditor type={type}/></AdminOnly>}/>,
    <Route key={`${type}-edit`} path={`admin/${type}/edit/:slug`} element={<AdminOnly><AdminEditor type={type}/></AdminOnly>}/>,
    <Route key={`${type}-delete`} path={`admin/${type}/delete/:slug`} element={<AdminOnly><LegacyDelete type={type}/></AdminOnly>}/>,
    <Route key={`${type}-view`} path={`admin/${type}/view`} element={<Navigate to={`/admin/${type}`} replace/>}/>
  ])}
  <Route path="admin/flags" element={<AdminOnly><AdminFlags/></AdminOnly>}/><Route path="*" element={<NotFound/>}/>
</Route></Routes></Suspense></AuthProvider></BrowserRouter></ErrorBoundary></React.StrictMode>);
