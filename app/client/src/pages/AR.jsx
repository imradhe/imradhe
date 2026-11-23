import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import OriginalMarkup from '../original/OriginalMarkup';
import useOriginalPage, { loadScript } from '../original/useOriginalPage';
import carousel from '../original/ar-index.html?raw';
import ironman from '../original/ar-ironman.html?raw';
import spiderman from '../original/ar-spiderman.html?raw';
import chotabheem from '../original/ar-chotabheem.html?raw';
import carouselCss from '../original/styles/ar-carousel.css?raw';
const owlStyles = ['https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css', 'https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.theme.default.min.css'];
const modelStyles = ['https://fonts.googleapis.com/icon?family=Material+Icons', 'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'];
export default function AR() {
  const { model } = useParams();
  const single = !!model;
  useOriginalPage({ styles: single ? modelStyles : owlStyles, css: single ? '' : carouselCss, bodyClass: '', bodyStyle: single ? 'margin: 0; padding: 0; background-color: #ffffff; display: flex; justify-content: center; align-items: center; height: 100vh;' : '', title: single ? 'Ironman AR Model' : 'AR Model Viewer Carousel' });
  useEffect(() => {
    let cancelled = false, carouselElement;
    import('@google/model-viewer').then(({ ModelViewerElement }) => { ModelViewerElement.dracoDecoderLocation = '/assets/jsm/libs/draco/gltf/'; ModelViewerElement.ktx2TranscoderLocation = '/assets/jsm/libs/basis/'; }).catch(() => {});
    if (!single) loadScript('/assets/jquery/jquery.min.js').then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js')).then(() => {
      if (cancelled) return;
      carouselElement = window.jQuery('.owl-carousel');
      carouselElement.owlCarousel({ items: 1, loop: true, margin: 10, nav: true, dots: true, autoplay: false, autoplayTimeout: 5000, autoplayHoverPause: true });
    }).catch(() => {});
    return () => { cancelled = true; carouselElement?.trigger('destroy.owl.carousel'); };
  }, [model]);
  const templates = { ironman, spiderman, chotabheem };
  let html = single ? templates[model] : carousel;
  if (!html) return null;
  return <OriginalMarkup html={html} replace={(node, render) => {
    if (node.attribs.id === 'toggleSound') return render(undefined, { onClick: () => { const audio = document.getElementById('backgroundAudio'); audio.muted = !audio.muted; document.getElementById('soundIcon').textContent = audio.muted ? 'volume_off' : 'volume_up'; } });
  }}/>;
}
