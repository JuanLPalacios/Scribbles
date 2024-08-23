import ReactDOM from 'react-dom/client';
import ReactModal from 'react-modal';
import App from './App';
import { AppStateProvider } from './contexts/AppContext';
import { content, overlay } from './css/Modal.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './css/index.css';
import { loadAbrFromArrayBuffer } from 'abr-js';
import { base64 } from './base64-2';

ReactModal.defaultStyles = {
    content: { ...ReactModal.defaultStyles.content, ...content },
    overlay: { ...ReactModal.defaultStyles.overlay, ...overlay }
};

loadAbrFromArrayBuffer((Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer), 'test');

const root = ReactDOM.createRoot(document.getElementById('root') || document.body);
root.render(
    <AppStateProvider>
        <App />
    </AppStateProvider>);
// TODO: re implement pinch event on the drawing viewport
window.addEventListener('wheel', e=>{
    if (e.ctrlKey)e.preventDefault();
}, { passive: false });

serviceWorkerRegistration.register();