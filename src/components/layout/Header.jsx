import { useCallback } from 'react';
import { theme } from '../../styles/theme';
import UserMenu from '../project/UserMenu';

export default function Header({ tabs, activeTab, setActiveTab, user, onLogout }) {
  const handleKeyDown = useCallback((e) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  }, [tabs, activeTab, setActiveTab]);

  return (
    <header style={{
      background: `linear-gradient(180deg, ${theme.colors.bg.secondary} 0%, ${theme.colors.bg.primary} 100%)`,
      borderBottom: `1px solid ${theme.colors.bg.card}`, padding: "16px 24px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "1200px", margin: "0 auto",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{
              fontFamily: theme.fonts.display, fontSize: "26px",
              fontWeight: 900, color: theme.colors.gold.primary, letterSpacing: "1px",
            }}>
              PecuáriaClip
            </span>
            <span style={{
              fontFamily: theme.fonts.heading, fontSize: "14px",
              letterSpacing: "3px", color: theme.colors.text.dim,
            }}>
              PRO
            </span>
          </div>
          <div style={{
            fontFamily: theme.fonts.body, fontSize: "11px",
            color: theme.colors.text.dim, letterSpacing: "1px", marginTop: "2px",
          }}>
            EDITOR DE VÍDEOS PROFISSIONAIS PARA PECUÁRIA DE ELITE
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <nav
            role="tablist"
            aria-label="Navegação principal"
            onKeyDown={handleKeyDown}
            style={{
              display: "flex", gap: "4px", background: theme.colors.bg.tertiary,
              borderRadius: "8px", padding: "3px",
              overflowX: "auto", maxWidth: "100%",
            }}
          >
            {tabs.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                aria-controls={`tabpanel-${t.id}`}
                tabIndex={activeTab === t.id ? 0 : -1}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "8px 14px", border: "none", borderRadius: "6px",
                  cursor: "pointer", whiteSpace: "nowrap",
                  background: activeTab === t.id ? theme.colors.gold.muted : "transparent",
                  color: activeTab === t.id ? theme.colors.gold.primary : theme.colors.text.dim,
                  fontFamily: theme.fonts.heading, fontSize: "13px",
                  letterSpacing: "2px", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }} aria-hidden="true">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {user && <UserMenu user={user} onLogout={onLogout} />}
        </div>
      </div>
    </header>
  );
}
