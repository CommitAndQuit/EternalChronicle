import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { assetUrl } from './lib/assets';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(assetUrl('/sw.js')).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
