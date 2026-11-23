import { useEffect, useState } from 'react';
import OriginalMarkup from '../original/OriginalMarkup';
import useOriginalPage, { loadScript } from '../original/useOriginalPage';
import template from '../original/form-demo.html?raw';
export default function FormDemo() {
  const [sent, setSent] = useState(false);
  useOriginalPage({ styles: ['https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css'], bodyClass: '', title: 'Google Form in Bootstrap Modal' });
  useEffect(() => { loadScript('/assets/jquery/jquery.min.js').then(() => loadScript('https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js')).catch(() => {}); }, []);
  return <OriginalMarkup html={template} replace={(node, render) => {
    if (node.attribs.id === 'googleForm') return render(undefined, { style: sent ? { display: 'none' } : undefined, onSubmit: async event => {
      event.preventDefault(); const data = new URLSearchParams(new FormData(event.currentTarget));
      try { await fetch('https://docs.google.com/forms/d/e/1FAIpQLSc_w7T7ztLrmSMObv49aYDliSRRWvmHMk6Xs0sJjyl2A_86Ig/formResponse', { method: 'POST', mode: 'no-cors', body: data }); setSent(true); } catch (error) { console.error(error); }
    } });
    if (node.attribs.id === 'formStatus') return render(undefined, { style: { display: sent ? 'block' : 'none' } });
  }}/>;
}
