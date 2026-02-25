import { theme } from '../../styles/theme';
import UserMenu from '../project/UserMenu';

export default function Header({ tabs, activeTab, setActiveTab, user, onLogout }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #110E0A 0%, #0D0B08 100%)",
      borderBottom: `1px solid ${theme.colors.bg.card}`, padding: "16px 24px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: "1200px", margin: "0 auto",
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
          <div style={{
            display: "flex", gap: "4px", background: theme.colors.bg.tertiary,
            borderRadius: "8px", padding: "3px",
          }}>
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "8px 14px", border: "none", borderRadius: "6px",
                  cursor: "pointer",
                  background: activeTab === t.id ? theme.colors.gold.muted : "transparent",
                  color: activeTab === t.id ? theme.colors.gold.primary : theme.colors.text.dim,
                  fontFamily: theme.fonts.heading, fontSize: "13px",
                  letterSpacing: "2px", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <span style={{ fontSize: "14px" }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {user && <UserMenu user={user} onLogout={onLogout} />}
        </div>
      </div>
    </div>
  );
}
