import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { useResource } from '../hooks';
import OriginalMarkup, { interpolate } from '../original/OriginalMarkup';
import useOriginalPage, { adminStyles, loadScript } from '../original/useOriginalPage';
import header from '../original/admin-header.html?raw';
import sidebar from '../original/admin-sidebar.html?raw';
import listCss from '../original/styles/admin-list.css?raw';
import storyNew from '../original/admin-stories-new.html?raw';
import storyEdit from '../original/admin-stories-edit.html?raw';
import sceneNew from '../original/admin-scenes-new.html?raw';
import sceneEdit from '../original/admin-scenes-edit.html?raw';
function AdminLayout({ children, css = '' }) {
  const { pathname } = useLocation();
  useOriginalPage({ styles: adminStyles, css, bodyClass: '', title: 'Radhe Shyam Salopanthula Admin Panel' });
  return <><OriginalMarkup html={header}/><div className="container-fluid"><div className="row"><OriginalMarkup html={sidebar} replace={(node, render) => { const attrs = node.attribs; if (attrs.class?.includes('nav-link') && attrs.href === pathname) return render(undefined, { className: attrs.class + ' active' }); }}/>{children}</div></div></>;
}
export function AdminHome() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return <AdminLayout css=".apexcharts-toolbar{display:none!important}"><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><h1 className="text-center mt-5"><i className="bi bi-clock"/>{' '}<span id="time">{String(time.getHours() % 12 || 12).padStart(2, '0')}:{String(time.getMinutes()).padStart(2, '0')} {time.getHours() >= 12 ? 'PM' : 'AM'}</span></h1></main></AdminLayout>;
}
const identifier = type => type === 'stories' ? 'storyID' : type === 'scenes' ? 'sceneID' : 'slug';
function DeleteModal({ item, type, onDelete }) {
  const id = item[identifier(type)]; const noun = type === 'stories' ? 'Story' : type === 'scenes' ? 'Scene' : 'Post';
  return <div className="modal fade" id={`delete${id}`} tabIndex="-1" aria-hidden="true"><div className="modal-dialog modal-dialog-centered"><div className="modal-content"><div className="modal-header"><h5 className="modal-title">Delete {noun} - {item.title}</h5><button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"/></div><div className="modal-body text-center">Are you sure you want to delete this {noun}?</div><div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No</button><form onSubmit={event => { event.preventDefault(); onDelete(item); }}><button type="submit" className="btn btn-primary">Yes</button></form></div></div></div></div>;
}
export function AdminList({ type }) {
  const resource = useResource(`/admin/${type}`); const [error, setError] = useState(''); const table = useRef(null);
  useEffect(() => {
    if (!resource.data) return;
    let cancelled = false;
    loadScript('/assets/jquery/jquery.min.js').then(() => loadScript('https://cdn.datatables.net/1.10.25/js/jquery.dataTables.min.js')).then(() => loadScript('https://cdn.datatables.net/1.10.25/js/dataTables.bootstrap5.min.js')).then(() => {
      if (cancelled) return;
      table.current = window.jQuery('#myTable').DataTable({ language: { search: '' } });
      const search = document.querySelector('#myTable_filter input'); search.placeholder = 'Search'; search.classList.remove('form-control-sm'); search.style.width = '350px';
    }).catch(() => {});
    return () => { cancelled = true; table.current?.destroy(); table.current = null; };
  }, [resource.data]);
  async function remove(item) {
    try {
      await api(`/admin/${type}/${item[identifier(type)]}`, { method: 'DELETE', body: {} });
      const modal = document.getElementById(`delete${item[identifier(type)]}`); window.bootstrap?.Modal.getInstance(modal)?.hide();
      // Match the original navigation after deletion, without mutating through GET.
      window.location.assign(`/admin/${type}`);
    } catch (e) { setError(e.message); }
  }
  const noun = type === 'stories' ? 'Stories' : type === 'scenes' ? 'Scenes' : 'Posts';
  const columns = type === 'stories' ? ['Story ID', 'Title', 'Author', 'Genre', 'Description', 'Story Cover', 'Tags', 'Action'] : type === 'scenes' ? ['Scene ID', 'Title', 'Act', 'Chapter', 'Scene', 'Story ID', 'Action'] : ['Slug', 'Title', 'Date', 'Draft', 'Action'];
  return <AdminLayout css={listCss}><main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3"><h1 className="h2 mb-5">All {noun}</h1><a href={`/admin/${type}/new?back=${type}`} className="btn btn-secondary float-end mt-5 me-5"><i className="bi bi-plus-circle"/> New </a></div>{error && <p className="text-danger" role="alert">{error}</p>}<div className="table-responsive mb-5"><table id="myTable" className="table table-striped table-sm"><thead><tr>{columns.map((name, i) => <th className={i === columns.length - 1 ? 'text-center' : i === 4 ? 'text-wrap' : 'text-nowrap'} key={name}>{name}</th>)}</tr></thead><tbody>{resource.data?.map(item => {
    const id = item[identifier(type)];
    const values = type === 'stories' ? [id, item.title, item.author, item.genre, item.description, item.cover, item.tags.join(', ')] : type === 'scenes' ? [id, item.title, item.actNumber, item.chapterNumber, item.sceneNumber, item.storyID] : [id, item.title, item.date?.slice(0, 10), item.draft ? 'Yes' : 'No'];
    return <tr key={id}>{values.map((value, i) => <td className="text-wrap" key={i}>{i === 0 ? <a target="_blank" href={type === 'stories' ? `/story/${id}` : type === 'scenes' ? `/scene/${id}` : `/blog/${id}`}>{value}</a> : value}</td>)}<td className="Action text-center text-nowrap"><a className="btn action-btn btn-sm btn-secondary text-white" href={`/admin/${type}/edit/${id}?back=${type}`} aria-label={`Edit ${item.title}`}> <i className="bi bi-pencil-square"/></a>{' '}<a className="ms-3 btn action-btn btn-sm btn-danger text-white" data-bs-toggle="modal" data-bs-target={`#delete${id}`} aria-label={`Delete ${item.title}`}> <i className="bi bi-trash"/></a></td></tr>;
  })}</tbody></table></div>{resource.data?.map(item => <DeleteModal key={item._id} item={item} type={type} onDelete={remove}/>)}</main></AdminLayout>;
}
function EditorForm({ type, item, stories, genres }) {
  const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const editor = useRef(null);
  const editing = !!item; const id = identifier(type); const defaults = item || {};
  useEffect(() => {
    if (type !== 'scenes') return;
    let cancelled = false;
    loadScript('https://cdn.ckeditor.com/ckeditor5/35.3.1/classic/ckeditor.js').then(async () => {
      if (cancelled) return;
      const config = editing ? { alignment: { options: ['left', 'right', 'center'] }, toolbar: { items: ['heading', '|', 'fontfamily', 'fontsize', '|', 'alignment', '|', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|', 'link', '|', 'outdent', 'indent', '|', 'bulletedList', 'numberedList', 'todoList', '|', 'code', 'codeBlock', '|', 'insertTable', '|', 'uploadImage', 'blockQuote', '|', 'undo', 'redo'] } } : {};
      const instance = await window.ClassicEditor.create(document.querySelector('#content'), config);
      if (cancelled) await instance.destroy(); else editor.current = instance;
    }).catch(() => {});
    return () => { cancelled = true; editor.current?.destroy(); editor.current = null; };
  }, [type, editing]);
  async function save(event) {
    event.preventDefault(); const body = Object.fromEntries(new FormData(event.currentTarget));
    if (body.tags !== undefined) body.tags = body.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (type === 'scenes' && editor.current) body.content = editor.current.getData();
    if (type === 'scenes' && !editing) for (const field of ['actNumber', 'chapterNumber', 'sceneNumber']) body[field] = Number(body[field]);
    if (type === 'posts') body.draft = body.draft === 'on';
    setError(''); setBusy(true);
    try { await api(`/admin/${type}${editing ? `/${item[id]}` : ''}`, { method: editing ? 'PUT' : 'POST', body }); navigate(`/admin/${type}`); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (type === 'posts') return <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4"><h1 className="h2 pt-3">{editing ? 'Edit Post' : 'New Post'}</h1><form className="container" onSubmit={save}><div className="row">{['title', 'slug', 'description', 'date', 'tags'].map(name => <div className="col-sm-4 mb-3" key={name}><label className="form-label" htmlFor={name}>{name}</label><input className="form-control" name={name} id={name} defaultValue={name === 'tags' ? (defaults.tags || []).join(', ') : name === 'date' ? (defaults.date || new Date().toISOString()).slice(0, 10) : defaults[name] || ''} readOnly={name === 'slug' && editing} required={name === 'title' || name === 'slug'} type={name === 'date' ? 'date' : 'text'}/></div>)}<div className="col-sm-12 mb-3"><textarea className="form-control" name="body" defaultValue={defaults.body || ''} rows={15} required/></div><div className="col-sm-12"><label><input type="checkbox" name="draft" defaultChecked={defaults.draft ?? true}/> Draft</label></div><div className="col-sm-12 my-5"><a href="/admin/posts" className="btn btn-secondary">Back</a>{' '}<button type="submit" className="btn btn-primary" disabled={busy}>{editing ? 'Update' : 'Add'}</button></div></div>{error && <p role="alert">{error}</p>}</form></main>;
  const raw = type === 'stories' ? editing ? storyEdit : storyNew : editing ? sceneEdit : sceneNew;
  return <OriginalMarkup html={interpolate(raw, { title: defaults.title })} replace={(node, render) => {
    const attrs = node.attribs;
    if (node.name === 'form') return render(<>{error && <p role="alert">{error}</p>}<OriginalMarkup html={raw.slice(raw.indexOf('<div class="row">'), raw.lastIndexOf('</form>'))} replace={fields}/></>, { onSubmit: save });
  }}/>;
  function fields(node, render) {
    const attrs = node.attribs; const name = attrs.name;
    if (node.name === 'input' && name) return <input type={attrs.type} className={attrs.class} id={attrs.id} name={name} required={attrs.required !== undefined} defaultValue={name === 'tags' ? (defaults.tags || []).join(', ') : defaults[name] ?? ''} onKeyUp={name === 'title' && type === 'stories' && !editing ? event => { document.querySelector('#storyID').value = event.currentTarget.value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''); } : undefined}/>;
    if (attrs.id === 'genre') return <select className="form-control" id="genre" name="genre" required defaultValue={defaults.genre || 'Choose Genre'}><option value="Choose Genre" disabled hidden>Choose Genre</option>{genres.map(genre => <option key={genre} value={genre}>{genre[0].toUpperCase() + genre.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2')}</option>)}</select>;
    if (attrs.id === 'storyID' && node.name === 'select') return <select className="form-control" id="storyID" name="storyID" required defaultValue={defaults.storyID || 'Choose Story'}><option value="Choose Story" disabled hidden>Choose Story</option>{[...stories].sort((a, b) => a.storyID.localeCompare(b.storyID)).map(story => <option value={story.storyID} key={story.storyID}>{story.title}</option>)}</select>;
    if (attrs.id === 'content') return <textarea name="content" id="content" defaultValue={defaults.content || ''}/>;
    if (attrs.id === 'btn-submit') return render(undefined, { disabled: busy });
  }
}
export function AdminEditor({ type }) {
  const { slug } = useParams(); const record = useResource(slug ? `/admin/${type}/${encodeURIComponent(slug)}` : '/genres'); const stories = useResource('/admin/stories'); const genres = useResource('/genres');
  const loaded = !record.loading && !stories.loading && !genres.loading;
  return <AdminLayout>{loaded && !record.error && !stories.error && !genres.error && <EditorForm key={slug || type} type={type} item={slug ? record.data : null} stories={stories.data} genres={genres.data}/>}</AdminLayout>;
}
