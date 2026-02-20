
/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { CacheProvider } from './contexts/CacheContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('SW registered successfully:', registration.scope);
      })
      .catch(registrationError => {
        console.warn('SW registration failed:', registrationError);
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CacheProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CacheProvider>
    </AuthProvider>
  </React.StrictMode>
);
