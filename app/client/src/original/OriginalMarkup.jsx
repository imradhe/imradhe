import React from 'react';
import parse, { attributesToProps, domToReact } from 'html-react-parser';
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
      const result = replace?.(node, (children, props = {}) => (['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'].includes(node.name) ? React.createElement(node.name, { ...attributesToProps(node.attribs), ...props }) : React.createElement(node.name, { ...attributesToProps(node.attribs), ...props }, children ?? domToReact(node.children || [], options))));
      if (result !== undefined) return result;
    }
  } };
  return <>{parse(html, options)}</>;
}
