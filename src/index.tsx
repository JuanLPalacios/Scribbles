import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactModal from 'react-modal';
import App from './App';
import { AppStateProvider } from './AppContext';
import './css/index.css';

ReactModal.defaultStyles = {
    content: {
        ...ReactModal.defaultStyles.content,
        background: 'var(--background-color)',
        border: 'solid 1px var(--secondary-color)',
    },
    overlay: {
        ...ReactModal.defaultStyles.overlay,
        background: 'var(--overlay-color)'
    }
};

const root = ReactDOM.createRoot(document.getElementById('root') || document.body);
root.render(
    <React.StrictMode>
        <AppStateProvider>
            <App />
        </AppStateProvider>
    </React.StrictMode>,
);
