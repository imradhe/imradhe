import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageTitle } from '../components/Common';
const models = { ironman: 'Ironman', tomnjerry: 'Tom & Jerry', hulk: 'Hulk', chotabheem: 'Chota Bheem', spiderman: 'Spiderman' };
export default function AR() {
  const { model } = useParams(); const [index, setIndex] = useState(0); const [ready, setReady] = useState(false); const [error, setError] = useState('');
  const audio = useRef(null); const [playing, setPlaying] = useState(false);
  const key = model || Object.keys(models)[index];
  useEffect(() => { import('@google/model-viewer').then(({ ModelViewerElement }) => { ModelViewerElement.dracoDecoderLocation = '/assets/jsm/libs/draco/gltf/'; ModelViewerElement.ktx2TranscoderLocation = '/assets/jsm/libs/basis/'; setReady(true); }).catch(() => setError('The model viewer could not be loaded. Please reload.')); }, []);
  useEffect(() => { setPlaying(false); setError(''); audio.current?.pause(); }, [key]);
  if (!models[key]) return <><h1>Model not found</h1><Link to="/ar">Browse AR models</Link></>;
  const music = ['ironman', 'hulk', 'spiderman'].includes(key) ? 'avengers' : key;
  return <><PageTitle title={`${models[key]} AR`}/><div className="page-heading"><h1>{models[key]}</h1><Link to="/ar/test">Form demo</Link></div><p className="muted">Drag to rotate. On a supported phone, choose “View in your space”. AR requires HTTPS and camera permission.</p>{error && <p role="alert" className="error">{error}</p>}{ready ? <model-viewer key={key} src={`/assets/ar/${key}.glb`} alt={`3D model of ${models[key]}`} ar="" ar-modes="webxr scene-viewer quick-look" camera-controls="" auto-rotate="" autoplay="" onError={() => setError('This model could not be loaded.')}><button slot="ar-button">View in your space</button></model-viewer> : <p role="status">Loading model viewer…</p>}<div className="actions">{!model && <><button onClick={() => setIndex((index + 4) % 5)}>Previous</button><button onClick={() => setIndex((index + 1) % 5)}>Next</button></>}<button className="secondary" onClick={async () => { if (playing) { audio.current.pause(); setPlaying(false); } else { try { await audio.current.play(); setPlaying(true); } catch { setError('Sound playback is unavailable.'); } } }}>{playing ? 'Pause sound' : 'Play sound'}</button></div><audio key={key} ref={audio} src={`/assets/audio/${music}.mp3`} loop preload="none"/><nav className="filters" aria-label="Choose a model">{Object.entries(models).map(([id, title]) => <Link key={id} className="button secondary" to={`/ar/${id}`}>{title}</Link>)}</nav></>;
}
