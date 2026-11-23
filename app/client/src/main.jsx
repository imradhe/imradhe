import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AdminOnly } from './auth';
import Layout from './components/Layout';
import NotFound from './pages/NotFound';
import Portfolio from './pages/Portfolio';
import { BlogIndex, BlogPost, Scene } from './pages/Reading';
import { AuthForm, Logout } from './pages/Auth';
import { AdminHome, AdminList, AdminEditor } from './pages/Admin';
import { SpeechToText, SpeechDemo, Call, ArchivedChat, MarkerDemo } from './pages/Experiments';
import FormDemo from './pages/FormDemo';
import { AdminEntries, AdminEntryEditor, AdminProfile, AdminPage, AdminDocuments } from './pages/AdminPortfolio';

const AR = lazy(() => import('./pages/AR'));
const Chess = lazy(() => import('./pages/Chess'));
const Streak = lazy(() => import('./pages/Streak'));
const Dhwani = lazy(() => import('./pages/Dhwani'));
class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <NotFound/> : this.props.children; }
}
createRoot(document.getElementById('root')).render(<><ErrorBoundary><BrowserRouter><AuthProvider><Suspense fallback={null}><Routes><Route element={<Layout/>}>
  {['/', '/education', '/skills', '/projects', '/experience', '/interests', '/publications'].map(path => <Route key={path} path={path} element={<Portfolio/>}/>)}
  <Route path="blog" element={<BlogIndex/>}/><Route path="blog/:slug" element={<BlogPost/>}/>
  <Route path="scene/:slug" element={<Scene/>}/>
  <Route path="login" element={<AuthForm/>}/><Route path="register" element={<AuthForm register/>}/><Route path="logout" element={<Logout/>}/>
  <Route path="ar" element={<AR/>}/><Route path="ar/test" element={<FormDemo/>}/><Route path="ar/:model" element={<AR/>}/>
  <Route path="test" element={<MarkerDemo/>}/>
  <Route path="call" element={<Call/>}/><Route path="chess" element={<Chess/>}/><Route path="balloon" element={<SpeechDemo/>}/><Route path="wav2vec" element={<SpeechToText/>}/><Route path="deepseek-or-deepfake" element={<ArchivedChat/>}/>
  <Route path="streak" element={<Streak key="session"/>}/><Route path="streak/new" element={<Streak key="daily"/>}/><Route path="dhwani" element={<Dhwani/>}/>
  <Route path="admin" element={<AdminOnly><AdminHome/></AdminOnly>}/>
  <Route path="admin/entries/:kind" element={<AdminOnly><AdminEntries/></AdminOnly>}/>
  <Route path="admin/entries/:kind/new" element={<AdminOnly><AdminEntryEditor/></AdminOnly>}/>
  <Route path="admin/entries/:kind/edit/:id" element={<AdminOnly><AdminEntryEditor/></AdminOnly>}/>
  <Route path="admin/profile" element={<AdminOnly><AdminProfile/></AdminOnly>}/>
  <Route path="admin/documents" element={<AdminOnly><AdminDocuments/></AdminOnly>}/>
  <Route path="admin/pages/:key" element={<AdminOnly><AdminPage/></AdminOnly>}/>
  {['stories', 'scenes', 'posts'].flatMap(type => [
    <Route key={type} path={`admin/${type}`} element={<AdminOnly><AdminList type={type}/></AdminOnly>}/>,
    <Route key={`${type}-new`} path={`admin/${type}/new`} element={<AdminOnly><AdminEditor type={type}/></AdminOnly>}/>,
    <Route key={`${type}-edit`} path={`admin/${type}/edit/:slug`} element={<AdminOnly><AdminEditor type={type}/></AdminOnly>}/>,
    <Route key={`${type}-delete`} path={`admin/${type}/delete/:slug`} element={<Navigate to={`/admin/${type}`} replace/>}/>
  ])}
  <Route path="*" element={<NotFound/>}/>
</Route></Routes></Suspense></AuthProvider></BrowserRouter></ErrorBoundary></>);
