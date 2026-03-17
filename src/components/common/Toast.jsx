import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { theme } from '../../styles/theme';

/**
 * Toast notification system.
 * Provides a context + hook for showing temporary messages.
 */

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback when not wrapped in provider
    return {
      showToast: (msg) => console.log('[Toast]', msg),
      showError: (msg) => console.error('[Toast Error]', msg),
      showSuccess: (msg) => console.log('[Toast Success]', msg),
    };
  }
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const showToast = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);
  const showError = useCallback((message, duration) => addToast(message, 'error', duration || 6000), [addToast]);
  const showSuccess = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
      {children}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: theme.zIndex.toast,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '380px',
        }}>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const colors = {
    info: { bg: theme.colors.bg.secondary, border: theme.colors.gold.primary, text: theme.colors.text.secondary },
    error: { bg: 'rgba(139,0,0,0.15)', border: '#8B0000', text: '#CC4444' },
    success: { bg: 'rgba(46,125,50,0.15)', border: '#2E7D32', text: '#4CAF50' },
  };

  const c = colors[toast.type] || colors.info;
  const icons = { info: 'i', error: '!', success: '✓' };

  return (
    <div
      style={{
        padding: '12px 16px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(40px)',
        transition: 'all 0.3s ease-out',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: c.border,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        flexShrink: 0,
      }}>
        {icons[toast.type]}
      </div>

      <div style={{
        flex: 1,
        fontFamily: theme.fonts.body,
        fontSize: '12px',
        color: c.text,
        lineHeight: 1.4,
      }}>
        {toast.message}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: theme.colors.text.dim,
          cursor: 'pointer',
          fontSize: '14px',
          padding: '2px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
