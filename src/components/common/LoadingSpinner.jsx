import { theme } from '../../styles/theme';

/**
 * Loading spinner reutilizável.
 * Suporta tamanhos small, medium, large e mensagem customizada.
 */
export default function LoadingSpinner({ size = 'medium', message = '' }) {
  const sizes = {
    small: { spinner: 20, border: 2, font: 10 },
    medium: { spinner: 36, border: 3, font: 12 },
    large: { spinner: 50, border: 4, font: 14 },
  };

  const s = sizes[size] || sizes.medium;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      padding: '20px',
    }}>
      <div style={{
        width: `${s.spinner}px`,
        height: `${s.spinner}px`,
        border: `${s.border}px solid ${theme.colors.border.primary}`,
        borderTop: `${s.border}px solid ${theme.colors.gold.primary}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {message && (
        <div style={{
          fontFamily: theme.fonts.body,
          fontSize: `${s.font}px`,
          color: theme.colors.text.dim,
          textAlign: 'center',
        }}>
          {message}
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
