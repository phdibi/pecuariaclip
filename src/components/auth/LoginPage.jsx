import { theme } from '../../styles/theme';

/**
 * Tela de login com Google.
 * Design alinhado com o visual do PecuariaClip Pro (dark + gold).
 */
export default function LoginPage({ onLogin, error, loading }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.bg.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '380px',
        padding: '40px',
        background: theme.colors.bg.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: theme.fonts.display,
          fontSize: '32px',
          color: theme.colors.gold.primary,
          marginBottom: '4px',
        }}>
          PecuáriaClip
        </div>
        <div style={{
          fontFamily: theme.fonts.heading,
          fontSize: '11px',
          letterSpacing: '4px',
          color: theme.colors.text.dim,
          marginBottom: '32px',
        }}>
          EDITOR DE VÍDEOS PROFISSIONAIS
        </div>

        {/* Divider */}
        <div style={{
          width: '60px',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${theme.colors.gold.primary}, transparent)`,
          margin: '0 auto 32px',
        }} />

        {/* Description */}
        <div style={{
          fontFamily: theme.fonts.body,
          fontSize: '13px',
          color: theme.colors.text.muted,
          lineHeight: 1.6,
          marginBottom: '28px',
        }}>
          Faça login para criar projetos de vídeo profissionais
          para pecuária de elite.
        </div>

        {/* Google Login Button */}
        <button
          onClick={onLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 20px',
            border: 'none',
            borderRadius: '8px',
            background: loading
              ? theme.colors.border.secondary
              : `linear-gradient(135deg, ${theme.colors.gold.primary}, #8B6914)`,
            color: '#000',
            fontFamily: theme.fonts.heading,
            fontSize: '14px',
            letterSpacing: '2px',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          {loading ? 'CONECTANDO...' : 'ENTRAR COM GOOGLE'}
        </button>

        {/* Error message */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '10px',
            borderRadius: '6px',
            background: 'rgba(139,0,0,0.1)',
            border: '1px solid rgba(139,0,0,0.3)',
            fontFamily: theme.fonts.body,
            fontSize: '11px',
            color: '#CC4444',
          }}>
            {error}
          </div>
        )}

        {/* Skip auth link (dev mode) */}
        <div style={{
          marginTop: '24px',
          fontFamily: theme.fonts.body,
          fontSize: '11px',
          color: theme.colors.text.dim,
        }}>
          Seus projetos ficam salvos na nuvem com segurança.
        </div>
      </div>
    </div>
  );
}
