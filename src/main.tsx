import ReactDOM from 'react-dom/client';
import ReactModal from 'react-modal';
import App from './App';
import { AppStateProvider } from './contexts/AppContext';
import { DemoRecorderProvider } from './contexts/DemoRecorderContext';
import { VideoRecorderProvider } from './contexts/VideoRecorderContext';
import { content, overlay } from './css/Modal.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './css/index.css';

ReactModal.defaultStyles = {
    content: { ...ReactModal.defaultStyles.content, ...content },
    overlay: { ...ReactModal.defaultStyles.overlay, ...overlay }
};

const appElement = document.getElementById('root') || document.body;
ReactModal.setAppElement(appElement);

const root = ReactDOM.createRoot(appElement);
root.render(
    <AppStateProvider>
        <DemoRecorderProvider>
            <VideoRecorderProvider>
                <App />
            </VideoRecorderProvider>
        </DemoRecorderProvider>
    </AppStateProvider>);
window.addEventListener('wheel', e=>{
    if (e.ctrlKey||e.deltaX !== 0)
        e.preventDefault();
}, { passive: false });
window.addEventListener('keyup', e=>{
    e.preventDefault();
}, { passive: false });
serviceWorkerRegistration.register();