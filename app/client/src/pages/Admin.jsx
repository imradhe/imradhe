import { useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useResource } from '../hooks';
import { Resource, PageTitle } from '../components/Common';

export function AdminNav() { return <nav className="tabs" aria-label="Administration">{['stories', 'scenes', 'posts', 'flags'].map(name => <NavLink key={name} to={`/admin/${name}`}>{name[0].toUpperCase() + name.slice(1)}</NavLink>)}</nav>; }
export function AdminHome() {
  const logs = useResource('/logs');
  return <><PageTitle title="Administration"/><h1>Administration</h1><AdminNav/><p>Manage stories, scenes, and blog posts.</p><h2>Recent logins</h2><Resource resource={logs}>{result => <div className="table-wrap"><table><thead><tr><th>Email</th><th>Signed in</th><th>Signed out</th></tr></thead><tbody>{result.data.map(log => <tr key={log._id}><td>{log.email}</td><td>{new Date(log.createdAt).toLocaleString()}</td><td>{log.loggedout ? 'Yes' : 'No'}</td></tr>)}</tbody></table></div>}</Resource></>;
}
const identifier = type => type === 'stories' ? 'storyID' : type === 'scenes' ? 'sceneID' : 'slug';
export function AdminList({ type }) {
  const resource = useResource(`/admin/${type}`); const [error, setError] = useState(''); const [busy, setBusy] = useState('');
  async function remove(item) {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    const id = item[identifier(type)]; setBusy(id); setError('');
    try { await api(`/admin/${type}/${id}`, { method: 'DELETE', body: {} }); resource.reload(); }
    catch (e) { setError(e.message); } finally { setBusy(''); }
  }
  return <><PageTitle title={`Manage ${type}`}/><h1>Manage {type}</h1><AdminNav/><p><Link className="button" to={`/admin/${type}/new`}>New {type === 'stories' ? 'story' : type.slice(0, -1)}</Link></p>{error && <p className="error" role="alert">{error}</p>}<Resource resource={resource}>{items => items.length ? <div className="table-wrap"><table><thead><tr><th>Title</th><th>Identifier</th><th>Actions</th></tr></thead><tbody>{items.map(item => <tr key={item._id}><td>{item.title}{item.draft && ' (draft)'}</td><td>{item[identifier(type)]}</td><td><div className="actions"><Link to={`/admin/${type}/edit/${item[identifier(type)]}`}>Edit</Link><button className="danger" disabled={busy === item[identifier(type)]} onClick={() => remove(item)}>Delete</button></div></td></tr>)}</tbody></table></div> : <p>No {type} yet.</p>}</Resource></>;
}
function EditorForm({ type, item, stories, genres }) {
  const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const id = identifier(type); const editing = !!item;
  const defaults = item || (type === 'stories' ? { genre: 'literaryFiction' } : type === 'scenes' ? { actNumber: 1, chapterNumber: 1, sceneNumber: 1 } : { draft: true, date: new Date().toISOString().slice(0, 10) });
  async function save(event) {
    event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget));
    if (body.tags !== undefined) body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (type === 'posts') body.draft = body.draft === 'on';
    if (type === 'scenes') for (const field of ['actNumber', 'chapterNumber', 'sceneNumber']) body[field] = Number(body[field]);
    setError(''); setBusy(true);
    try { await api(`/admin/${type}${editing ? `/${item[id]}` : ''}`, { method: editing ? 'PUT' : 'POST', body }); navigate(`/admin/${type}`); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  function input(name, title, options = {}) { return <label key={name}>{title}<input name={name} defaultValue={defaults[name] ?? ''} required {...options}/></label>; }
  return <form className="editor card" onSubmit={save}>
    {input('title', 'Title', { maxLength: 255 })}
    {type !== 'scenes' && input(id, type === 'stories' ? 'Story ID' : 'Slug', { pattern: '[a-z0-9]+(-[a-z0-9]+)*', readOnly: editing, maxLength: 255 })}
    {type === 'stories' && <>{input('author', 'Author', { maxLength: 255 })}<label>Genre<select name="genre" defaultValue={defaults.genre}>{genres.map(g => <option key={g}>{g}</option>)}</select></label>{input('cover', 'Cover URL (optional)', { required: false, maxLength: 2000 })}<label>Description<textarea name="description" defaultValue={defaults.description || ''} required maxLength={10000}/></label></>}
    {type === 'scenes' && <><label>Story<select name="storyID" defaultValue={defaults.storyID || ''} required><option value="" disabled>Choose a story</option>{stories.map(s => <option value={s.storyID} key={s.storyID}>{s.title}</option>)}</select></label><div className="grid-3">{['actNumber', 'chapterNumber', 'sceneNumber'].map(name => input(name, name.replace('Number', ' number'), { type: 'number', min: 0, max: 9999, step: 1 }))}</div><p className="muted">The scene ID is generated from its story and numbers. Content accepts HTML; scripts are removed.</p><label>Content (HTML)<textarea className="large mono" name="content" defaultValue={defaults.content || ''} required maxLength={1000000}/></label></>}
    {type === 'posts' && <><label>Description<textarea name="description" defaultValue={defaults.description || ''} maxLength={10000}/></label>{input('date', 'Publication date', { type: 'date', defaultValue: defaults.date ? new Date(defaults.date).toISOString().slice(0, 10) : '' })}<label className="checkbox"><input type="checkbox" name="draft" defaultChecked={defaults.draft}/>Draft (hidden from public blog)</label><label>Body (Markdown)<textarea className="large mono" name="body" defaultValue={defaults.body || ''} required maxLength={1000000}/></label></>}
    {type !== 'scenes' && <label>Tags, separated by commas<input name="tags" defaultValue={(defaults.tags || []).join(', ')} maxLength={5000}/></label>}
    {error && <p className="error" role="alert">{error}</p>}<div className="actions"><button disabled={busy}>{busy ? 'Saving…' : 'Save'}</button><Link to={`/admin/${type}`}>Cancel</Link></div>
  </form>;
}
export function AdminEditor({ type }) {
  const { slug } = useParams();
  const record = useResource(slug ? `/admin/${type}/${encodeURIComponent(slug)}` : '/genres');
  const stories = useResource('/admin/stories'); const genres = useResource('/genres');
  return <><PageTitle title={`${slug ? 'Edit' : 'New'} ${type}`}/><h1>{slug ? 'Edit' : 'New'} {type === 'stories' ? 'story' : type.slice(0, -1)}</h1><AdminNav/><Resource resource={record}>{item => <Resource resource={stories}>{storyList => <Resource resource={genres}>{genreList => <EditorForm key={slug || type} type={type} item={slug ? item : null} stories={storyList} genres={genreList}/>}</Resource>}</Resource>}</Resource></>;
}
export function LegacyDelete({ type }) {
  const { slug } = useParams(); const [error, setError] = useState(''); const navigate = useNavigate();
  return <><h1>Delete {type === 'stories' ? 'story' : 'scene'}?</h1><p>Confirm deletion of {slug}.</p>{error && <p role="alert">{error}</p>}<div className="actions"><button className="danger" onClick={async () => { try { await api(`/admin/${type}/${encodeURIComponent(slug)}`, { method: 'DELETE', body: {} }); navigate(`/admin/${type}`); } catch (e) { setError(e.message); } }}>Delete</button><Link to={`/admin/${type}`}>Cancel</Link></div></>;
}
export function AdminFlags() {
  const resource = useResource('/flags');
  return <><h1>Flags</h1><AdminNav/><Resource resource={resource}>{result => result.data.length ? <div className="table-wrap"><table><thead><tr><th>Project / Task</th><th>Role</th><th>Flag</th><th>Time</th></tr></thead><tbody>{result.data.map(f => <tr key={f._id}><td>{f.projectID} / {f.taskID}</td><td>{f.role}</td><td>{f.flag}</td><td>{new Date(f.time).toLocaleString()}</td></tr>)}</tbody></table></div> : <p>No flags yet.</p>}</Resource></>;
}
