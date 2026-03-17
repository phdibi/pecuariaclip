import { useState, useEffect, useRef } from 'react';
import { theme } from '../../styles/theme';

/**
 * User avatar/menu no header.
 * Mostra foto, nome, e botão de logout.
 */
export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu do usuário"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: `2px solid ${theme.colors.gold.primary}`,
          background: theme.colors.bg.tertiary,
          cursor: 'pointer',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: theme.fonts.heading,
            fontSize: '14px',
            color: theme.colors.gold.primary,
          }}>
            {(user.displayName || user.email || '?')[0].toUpperCase()}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: theme.zIndex.dropdown,
            }}
          />

          <div style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            width: '220px',
            background: theme.colors.bg.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: '8px',
            padding: '12px',
            zIndex: theme.zIndex.dropdown + 1,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          }}>
            <div style={{
              fontFamily: theme.fonts.body,
              fontSize: '12px',
              color: theme.colors.text.secondary,
              fontWeight: 600,
              marginBottom: '2px',
            }}>
              {user.displayName || 'Usuário'}
            </div>
            <div style={{
              fontFamily: theme.fonts.body,
              fontSize: '10px',
              color: theme.colors.text.dim,
              marginBottom: '12px',
            }}>
              {user.email}
            </div>

            <div style={{
              height: '1px',
              background: theme.colors.border.primary,
              margin: '8px 0',
            }} />

            <button
              onClick={() => { setOpen(false); onLogout(); }}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '6px',
                background: 'transparent',
                color: theme.colors.text.muted,
                fontFamily: theme.fonts.body,
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              Sair da conta
            </button>
          </div>
        </>
      )}
    </div>
  );
}
