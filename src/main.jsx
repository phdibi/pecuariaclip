import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AuthGuard from './components/auth/AuthGuard';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary showDetails>
      <ToastProvider>
        <AuthGuard>
          <App />
        </AuthGuard>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>
);
