import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// PWA Service Worker qeydiyyatı (Auto-reload ləğv edilib)
registerSW({
  onNeedRefresh() {
    // Səhifəni öz-özünə reload etməyə məcbur edən kod silindi
    console.log('Yeni versiya mövcuddur.');
  },
  onOfflineReady() {
    console.log('Tətbiq oflayn rejim üçün hazırdır.');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
