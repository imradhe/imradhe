import { useState } from 'react';
export default function FormDemo() {
  const [open, setOpen] = useState(false);
  return <><h1>Form demo</h1><button onClick={() => setOpen(true)}>Open form</button>{open && <dialog open aria-labelledby="form-title"><h2 id="form-title">Submit your details</h2><p>Open the original Google Form to send your attendance details.</p><div className="actions"><a className="button" target="_blank" rel="noopener noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLSc_w7T7ztLrmSMObv49aYDliSRRWvmHMk6Xs0sJjyl2A_86Ig/viewform">Continue to form</a><button className="secondary" onClick={() => setOpen(false)}>Close</button></div></dialog>}</>;
}
