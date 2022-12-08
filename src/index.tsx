import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppStateProvider } from './AppContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') || document.body);
root.render(
    <React.StrictMode>
        <AppStateProvider>
            <App />
        </AppStateProvider>
    </React.StrictMode>,
);
