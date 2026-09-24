
import React, { StrictMode } from 'react';
import { logger } from './utils/logger';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import { CacheProvider } from './contexts/CacheContext';

import { HelmetProvider } from 'react-helmet-async';

logger.debug("App initializing...");
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <CacheProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </CacheProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>
);
