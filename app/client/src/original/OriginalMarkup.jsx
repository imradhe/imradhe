import React from 'react';
import parse, { attributesToProps, domToReact } from 'html-react-parser';
import { Link } from 'react-router-dom';
// Same-app paths that should change the page client-side (no full reload, no stylesheet refetch).
// Assets, API routes and protocol-relative or absolute URLs keep their normal browser behaviour.
export function isRouted(node) {
  return node.name === 'a' && isAppPath(node.attribs.href) && !('download' in node.attribs) && !node.attribs.target;
}
export function isAppPath(href) {
  return typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !/^\/(assets|api|media)\//.test(href) && !/\.(pdf|mp3|wav|glb|zip)$/i.test(href.split(/[?#]/)[0]);
}
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function interpolate(template, values = {}, raw = []) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => raw.includes(key) ? String(values[key] ?? '') : escapeHtml(values[key]));
}
export default function OriginalMarkup({ html, replace }) {
  const options = { replace(node) {
    if (node.type === 'script' || node.name === 'script') return <></>;
    if (node.attribs) {
      // The original inline handlers are supplied as React handlers at their original nodes.
      for (const name of Object.keys(node.attribs)) if (/^on/i.test(name)) delete node.attribs[name];
      const result = replace?.(node, (children, props = {}) => {
        const attrs = attributesToProps(node.attribs);
        if (node.name === 'a' && isRouted(node)) { const { href, ...rest } = attrs; return <Link to={href} {...rest} {...props}>{children ?? domToReact(node.children || [], options)}</Link>; }
        if (['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(node.name)) return React.createElement(node.name, { ...attrs, ...props });
        return React.createElement(node.name, { ...attrs, ...props }, children ?? domToReact(node.children || [], options));
      });
      if (result !== undefined) return result;
      if (isRouted(node)) {
        const { href, ...props } = attributesToProps(node.attribs);
        return <Link to={href} {...props}>{domToReact(node.children || [], options)}</Link>;
      }
    }
  } };
  return <>{parse(html, options)}</>;
}
