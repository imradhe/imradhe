import OriginalMarkup from '../original/OriginalMarkup';
import useOriginalPage from '../original/useOriginalPage';
import template from '../original/not-found.html?raw';
import css from '../original/styles/not-found.css?raw';
export default function NotFound() { useOriginalPage({ css, bodyClass: '', title: 'Page Not Found | Radhe Shyam Salopanthula - PhD Scholar @ IIIT Hyderabad' }); return <OriginalMarkup html={template}/>; }
