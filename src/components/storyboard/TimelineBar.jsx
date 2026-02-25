import { TIMELINE_SECTIONS } from '../../constants/timeline-sections';
import { theme } from '../../styles/theme';

export default function TimelineBar({ activeSection, setActiveSection }) {
  return (
    <div style={{
      display: "flex", gap: "2px", background: theme.colors.bg.tertiary,
      borderRadius: "8px", padding: "4px", overflow: "auto",
    }}>
      {TIMELINE_SECTIONS.map((s) => (
        <button
          key={s.id}
          onClick={() => setActiveSection(s.id)}
          style={{
            flex: "1 0 auto", minWidth: "80px", padding: "8px 10px",
            border: "none", borderRadius: "6px", cursor: "pointer",
            textAlign: "center",
            background: activeSection === s.id ? s.color : "transparent",
            transition: "all 0.2s",
            opacity: activeSection === s.id ? 1 : 0.5,
          }}
        >
          <div style={{ fontSize: "16px" }}>{s.icon}</div>
          <div style={{
            fontFamily: theme.fonts.heading, fontSize: "11px",
            letterSpacing: "1.5px",
            color: activeSection === s.id ? "#fff" : theme.colors.text.muted,
            marginTop: "2px",
          }}>
            {s.label}
          </div>
          <div style={{
            fontFamily: theme.fonts.body, fontSize: "9px",
            color: activeSection === s.id ? "rgba(255,255,255,0.7)" : theme.colors.text.dim,
          }}>
            {s.duration}
          </div>
        </button>
      ))}
    </div>
  );
}
