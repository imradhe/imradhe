import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useResource } from '../hooks';
import { pageHelp } from '../original/pageText';
import { AdminLayout } from './Admin';

// Field lists drive both the form and the table. The server enforces the same rules.
export const sections = {
  education: { label: 'Education', heading: 'Institution', fields: [['institution', 'Institution', true], ['degree', 'Degree'], ['start', 'Start'], ['end', 'End'], ['description', 'Description', 'textarea']] },
  experience: { label: 'Experience', heading: 'Company', fields: [['company', 'Company', true], ['position', 'Position'], ['start', 'Start'], ['end', 'End'], ['description', 'Description', 'textarea']] },
  project: { label: 'Projects', heading: 'Title', fields: [['title', 'Title', true], ['description', 'Description', 'textarea'], ['imageUrl', 'Image URL or assets/ path'], ['links', 'Links (one per line: Label | URL)', 'textarea'], ['tags', 'Tags (comma separated)']] },
  publication: { label: 'Publications', heading: 'Title', fields: [['title', 'Title', true], ['authors', 'Authors'], ['venue', 'Venue or journal'], ['year', 'Year'], ['url', 'Link (DOI, paper or PDF)'], ['description', 'Notes', 'textarea']] }
};
const summary = { education: ['degree', 'start', 'end'], experience: ['position', 'start', 'end'], project: ['tags'], publication: ['venue', 'year'] };
const pageSections = { about: 'About', skills: 'Skills', interests: 'Interests' };
const kindFromPath = kind => (sections[kind] ? kind : null);
const linksToText = links => Object.entries(links || {}).map(([label, url]) => `${label} | ${url}`).join('\n');
const displayValue = (entry, key) => key === 'tags' ? (entry.tags || []).join(', ') : key === 'links' ? linksToText(entry.links) : entry[key] ?? '';
const fieldsValue = (entry, fields) => Object.fromEntries(fields.map(([key]) => [key, key === 'links' ? linksToText(entry.links) : key === 'tags' ? (entry.tags || []).join(', ') : entry[key] ?? '']));

export function AdminEntries() {
  const { kind } = useParams();
  const section = sections[kindFromPath(kind)];
  const resource = useResource(`/admin/entries?kind=${encodeURIComponent(kind)}`);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  if (!section) return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><p className="text-danger mt-5">Unknown section.</p></main></AdminLayout>;
  async function remove(entry) {
    if (!window.confirm(`Delete this ${section.label.replace(/s$/, '').toLowerCase()} entry?`)) return;
    try { await api(`/admin/entries/${entry._id}`, { method: 'DELETE', body: {} }); resource.reload(); }
    catch (e) { setError(e.message); }
  }
  async function move(entry, delta) {
    const list = resource.data || [];
    const index = list.findIndex(e => e._id === entry._id);
    const other = list[index + delta];
    if (!other) return;
    try {
      await api(`/admin/entries/${entry._id}`, { method: 'PUT', body: { order: other.order ?? index + delta } });
      await api(`/admin/entries/${other._id}`, { method: 'PUT', body: { order: entry.order ?? index } });
      resource.reload();
    } catch (e) { setError(e.message); }
  }
  return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3"><h1 className="h2">{section.label}</h1><button className="btn btn-secondary" onClick={() => navigate(`/admin/entries/${kind}/new`)}><i className="bi bi-plus-circle"/> New</button></div>{error && <p className="text-danger" role="alert">{error}</p>}{resource.loading && <p>Loading…</p>}{resource.error && <p className="text-danger" role="alert">{resource.error.message}</p>}<div className="table-responsive"><table className="table table-striped table-sm"><thead><tr><th className="text-nowrap">Order</th><th>{section.heading}</th>{summary[kind].map(k => <th key={k} className="text-nowrap">{k}</th>)}<th className="text-center">Action</th></tr></thead><tbody>{(resource.data || []).map((entry, index) => <tr key={entry._id}><td className="text-nowrap"><button className="btn btn-sm btn-outline-secondary me-1" aria-label="Move up" onClick={() => move(entry, -1)} disabled={index === 0}><i className="bi bi-arrow-up"/></button><button className="btn btn-sm btn-outline-secondary" aria-label="Move down" onClick={() => move(entry, 1)} disabled={index === resource.data.length - 1}><i className="bi bi-arrow-down"/></button></td><td>{entry.title || entry.institution || entry.company}</td>{summary[kind].map(k => <td key={k}>{displayValue(entry, k)}</td>)}<td className="text-center text-nowrap"><Link className="btn btn-sm btn-secondary text-white me-2" to={`/admin/entries/${kind}/edit/${entry._id}`} aria-label="Edit"><i className="bi bi-pencil-square"/></Link><button className="btn btn-sm btn-danger text-white" onClick={() => remove(entry)} aria-label="Delete"><i className="bi bi-trash"/></button></td></tr>)}</tbody></table></div>{resource.data && resource.data.length === 0 && <p className="text-muted">No entries yet.</p>}</main></AdminLayout>;
}

export function AdminEntryEditor() {
  const { kind, id } = useParams();
  const section = sections[kindFromPath(kind)];
  const editing = Boolean(id);
  const resource = useResource(editing ? `/admin/entries?kind=${encodeURIComponent(kind)}` : '/admin/entries?kind=' + encodeURIComponent(kind));
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const current = editing ? (resource.data || []).find(e => e._id === id) : null;
  useEffect(() => { if (section && (!editing || current) && values === null) setValues(fieldsValue(current || {}, section.fields)); }, [current, editing, section, values]);
  if (!section) return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><p className="text-danger mt-5">Unknown section.</p></main></AdminLayout>;
  if (editing && resource.data && !current) return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><p className="text-danger mt-5">Entry not found.</p></main></AdminLayout>;
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (editing) await api(`/admin/entries/${id}`, { method: 'PUT', body: { data: values } });
      else await api('/admin/entries', { method: 'POST', body: { kind, data: values } });
      navigate(`/admin/entries/${kind}`);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (values === null) return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><p className="mt-5">Loading…</p></main></AdminLayout>;
  return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><h1 className="h2 pt-3">{editing ? 'Edit' : 'New'} {section.label.replace(/s$/, '')}</h1>{error && <p className="text-danger" role="alert">{error}</p>}<form onSubmit={save} className="mb-5">{section.fields.map(([key, label, required]) => <div className="mb-3" key={key}><label className="form-label" htmlFor={key}>{label}</label>{section.fields.find(f => f[0] === key)[2] === 'textarea' ? <textarea id={key} className="form-control" rows={4} value={values[key]} onChange={e => setValues({ ...values, [key]: e.target.value })}/> : <input id={key} className="form-control" value={values[key]} required={Boolean(required)} onChange={e => setValues({ ...values, [key]: e.target.value })}/>}</div>)}<div className="d-flex gap-2"><Link className="btn btn-secondary" to={`/admin/entries/${kind}`}>Back</Link><button className="btn btn-primary" type="submit" disabled={busy}>{editing ? 'Update' : 'Add'}</button></div></form></main></AdminLayout>;
}

export function AdminProfile() {
  const resource = useResource('/admin/profile');
  const [form, setForm] = useState(null); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const keys = [['scholar', 'Google Scholar'], ['linkedin', 'LinkedIn'], ['github', 'GitHub'], ['instagram', 'Instagram'], ['twitter', 'Twitter / X']];
  const contacts = [['academicEmail', 'Academic email', 'email'], ['personalEmail', 'Professional / personal email', 'email'], ['phone', 'Phone', 'tel']];
  useEffect(() => { if (resource.data && form === null) setForm({ links: { ...resource.data.links }, contact: { ...resource.data.contact } }); }, [resource.data, form]);
  async function save(event) {
    event.preventDefault(); setError(''); setMessage('');
    try { const saved = await api('/admin/profile', { method: 'PUT', body: form }); setForm({ links: { ...saved.links }, contact: { ...saved.contact } }); setMessage('Saved.'); }
    catch (e) { setError(e.message); }
  }
  return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><h1 className="h2 pt-3">Profile</h1>{error && <p className="text-danger" role="alert">{error}</p>}{message && <p className="text-success" role="status">{message}</p>}{form && <form onSubmit={save} className="mb-5"><h2 className="h5 mt-4">Contact</h2>{contacts.map(([key, label, type]) => <div className="mb-3" key={key}><label className="form-label" htmlFor={key}>{label}</label><input id={key} type={type} className="form-control" value={form.contact[key] || ''} onChange={e => setForm({ ...form, contact: { ...form.contact, [key]: e.target.value } })}/></div>)}<h2 className="h5 mt-4">Links</h2>{keys.map(([key, label]) => <div className="mb-3" key={key}><label className="form-label" htmlFor={key}>{label}</label><input id={key} type="url" className="form-control" placeholder="https://" value={form.links[key] || ''} onChange={e => setForm({ ...form, links: { ...form.links, [key]: e.target.value } })}/></div>)}<button className="btn btn-primary" type="submit">Save</button></form>}</main></AdminLayout>;
}

export function AdminPage() {
  const { key } = useParams();
  const resource = useResource('/admin/pages');
  const [text, setText] = useState(null); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const page = (resource.data || []).find(p => p.key === key);
  useEffect(() => { if (page && text === null) setText(page.text || ''); }, [page, text]);
  if (!pageSections[key]) return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><p className="text-danger mt-5">Unknown page.</p></main></AdminLayout>;
  async function save(event) {
    event.preventDefault(); setError(''); setMessage('');
    try { await api(`/admin/pages/${key}`, { method: 'PUT', body: { text } }); setMessage('Saved.'); resource.reload(); }
    catch (e) { setError(e.message); }
  }
  return <AdminLayout><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><h1 className="h2 pt-3">{pageSections[key]} page</h1><p className="text-muted small">{pageHelp[key]}</p>{error && <p className="text-danger" role="alert">{error}</p>}{message && <p className="text-success" role="status">{message}</p>}{text !== null && <form onSubmit={save} className="mb-5"><textarea className="form-control mb-3" rows={20} value={text} onChange={e => setText(e.target.value)} aria-label={`${pageSections[key]} text`}/><button className="btn btn-primary" type="submit">Save</button></form>}</main></AdminLayout>;
}
