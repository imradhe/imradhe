import { useLayoutEffect } from 'react';
const baseStyles = ['/assets/bootstrap/css/bootstrap.min.css', 'https://fonts.googleapis.com/css2?family=Nunito', '/assets/bootstrap/icons/icons.css', '/assets/css/app.css'];
const scripts = new Map();
export function loadScript(src) {
  if (!scripts.has(src)) scripts.set(src, new Promise((resolve, reject) => {
    const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script);
  }));
  return scripts.get(src);
}
export default function useOriginalPage({ css = '', styles = baseStyles, bodyClass = 'light', bodyStyle = '', title, cssBeforeStyles = false } = {}) {
  useLayoutEffect(() => {
    document.documentElement.removeAttribute('data-theme');
    document.body.className = bodyClass;
    document.body.setAttribute('style', bodyStyle);
    if (title !== undefined) document.title = title;
    const style = document.createElement('style'); style.textContent = '#root { display: contents; }\n' + css;
    if (cssBeforeStyles) document.head.append(style);
    const nodes = styles.map(href => { const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = href; document.head.append(link); return link; });
    if (!cssBeforeStyles) document.head.append(style); nodes.push(style);
    if (styles.includes('/assets/bootstrap/css/bootstrap.min.css')) loadScript('/assets/bootstrap/js/bootstrap.bundle.min.js').catch(() => {});
    return () => { nodes.forEach(node => node.remove()); document.body.className = ''; document.body.removeAttribute('style'); };
  }, [css, bodyClass, bodyStyle, title, cssBeforeStyles, JSON.stringify(styles)]);
}
export const adminStyles = ['/assets/bootstrap/css/bootstrap.min.css', 'https://fonts.googleapis.com/css?family=Roboto+Condensed&subset=cyrillic&display=swap', 'https://cdn.datatables.net/1.10.25/css/dataTables.bootstrap5.min.css', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css', '/assets/css/admin.css'];
export const plainStyles = [];
