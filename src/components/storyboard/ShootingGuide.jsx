import { TIMELINE_SECTIONS } from '../../constants/timeline-sections';
import { SHOOTING_TIPS } from '../../constants/shooting-tips';
import { theme } from '../../styles/theme';

export default function ShootingGuide({ sectionId }) {
  const tips = SHOOTING_TIPS[sectionId] || [];
  const section = TIMELINE_SECTIONS.find(s => s.id === sectionId);

  return (
    <div style={{
      background: theme.colors.bg.secondary,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: "8px", padding: "16px",
    }}>
      <div style={{
        fontFamily: theme.fonts.heading, fontSize: "16px", letterSpacing: "2px",
        color: section?.color || theme.colors.gold.primary, marginBottom: "10px",
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <span>{section?.icon}</span> GUIA DE FILMAGEM — {section?.label}
      </div>
      <div style={{
        fontFamily: theme.fonts.body, fontSize: "12px",
        color: theme.colors.text.muted, marginBottom: "10px",
      }}>
        {section?.desc}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {tips.map((tip, i) => (
          <div key={i} style={{
            display: "flex", gap: "8px", alignItems: "flex-start",
            padding: "6px 10px", background: theme.colors.gold.subtle,
            borderRadius: "4px",
            borderLeft: `2px solid ${section?.color || theme.colors.gold.primary}`,
          }}>
            <span style={{
              fontFamily: theme.fonts.heading, fontSize: "14px",
              color: section?.color || theme.colors.gold.primary, minWidth: "16px",
            }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{
              fontFamily: theme.fonts.body, fontSize: "12px",
              color: theme.colors.text.secondary, lineHeight: 1.4,
            }}>
              {tip}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
