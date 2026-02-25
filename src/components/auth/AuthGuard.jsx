import { useAuth } from '../../hooks/useAuth';
import LoginPage from './LoginPage';
import { theme } from '../../styles/theme';

/**
 * AuthGuard: Wraps the app and requires login.
 * When Firebase is not configured (dev mode without env vars),
 * allows access without authentication.
 */
export default function AuthGuard({ children }) {
  const { user, loading, error, loginWithGoogle, isFirebaseConfigured } = useAuth();

  // When Firebase is not configured, skip auth entirely (dev mode)
  if (!isFirebaseConfigured) {
    return children;
  }

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.colors.bg.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${theme.colors.border.primary}`,
          borderTop: `3px solid ${theme.colors.gold.primary}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          fontFamily: theme.fonts.body,
          fontSize: '13px',
          color: theme.colors.text.dim,
        }}>
          Carregando...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in — show login page
  if (!user) {
    return (
      <LoginPage
        onLogin={loginWithGoogle}
        error={error}
        loading={loading}
      />
    );
  }

  // Authenticated — render children
  return children;
}
