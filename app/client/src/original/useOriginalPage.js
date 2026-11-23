import { useLayoutEffect } from 'react';
const baseStyles = ['/assets/bootstrap/css/bootstrap.min.css', 'https://fonts.googleapis.com/css2?family=Nunito', '/assets/bootstrap/icons/icons.css', '/assets/css/app.css'];
const scripts = new Map();
export function loadScript(src) {
  if (!scripts.has(src)) scripts.set(src, new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script);
  }));
  return scripts.get(src);
}
// Stylesheets are shared between pages, so they stay attached while any mounted page uses them.
// A sheet is only removed after it has been unused for a tick, so moving between pages never
// removes and re-downloads Bootstrap, fonts or icons.
const sheets = new Map();
function acquireSheet(href) {
  let entry = sheets.get(href);
  if (!entry) {
    // Adopt a stylesheet already in the app shell (index.html) so it is never duplicated or removed.
    const shell = [...document.querySelectorAll('link[rel="stylesheet"]')].find(link => link.getAttribute('href') === href);
    if (shell) { entry = { link: shell, count: 0, permanent: true }; sheets.set(href, entry); }
  }
  if (!entry) {
    const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.append(link);
    entry = { link, count: 0 }; sheets.set(href, entry);
  }
  entry.count += 1;
  return href;
}
function releaseSheet(href) {
  const entry = sheets.get(href); if (!entry) return;
  entry.count -= 1;
  if (entry.count <= 0 && !entry.permanent) setTimeout(() => { if (entry.count <= 0 && sheets.get(href) === entry) { entry.link.remove(); sheets.delete(href); } }, 0);
}
export default function useOriginalPage({ css = '', styles = baseStyles, bodyClass = 'light', bodyStyle = '', title, cssBeforeStyles = false } = {}) {
  useLayoutEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    document.body.className = bodyClass;
    document.body.setAttribute('style', bodyStyle);
    if (title !== undefined) document.title = title;
    const style = document.createElement('style'); style.textContent = '#root { display: contents; }\n' + css;
    if (cssBeforeStyles) document.head.append(style);
    const shared = styles.map(acquireSheet);
    if (!cssBeforeStyles) document.head.append(style);
    if (styles.includes('/assets/bootstrap/css/bootstrap.min.css')) loadScript('/assets/bootstrap/js/bootstrap.bundle.min.js').catch(() => {});
    return () => { shared.forEach(releaseSheet); style.remove(); document.body.className = ''; document.body.removeAttribute('style'); };
  }, [css, bodyClass, bodyStyle, title, cssBeforeStyles, JSON.stringify(styles)]);
}
export const adminStyles = ['/assets/bootstrap/css/bootstrap.min.css', 'https://fonts.googleapis.com/css?family=Roboto+Condensed&subset=cyrillic&display=swap', 'https://cdn.datatables.net/1.10.25/css/dataTables.bootstrap5.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css', '/assets/css/admin.css'];
export const plainStyles = [];
