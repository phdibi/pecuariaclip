import { useCallback } from 'react';
import { TIMELINE_SECTIONS } from '../../constants/timeline-sections';
import { theme } from '../../styles/theme';

export default function TimelineBar({ activeSection, setActiveSection }) {
  const handleKeyDown = useCallback((e) => {
    const currentIndex = TIMELINE_SECTIONS.findIndex(s => s.id === activeSection);
    if (e.key === 'ArrowRight' && currentIndex < TIMELINE_SECTIONS.length - 1) {
      setActiveSection(TIMELINE_SECTIONS[currentIndex + 1].id);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      setActiveSection(TIMELINE_SECTIONS[currentIndex - 1].id);
    }
  }, [activeSection, setActiveSection]);

  return (
    <div
      role="tablist"
      aria-label="Seções do storyboard"
      onKeyDown={handleKeyDown}
      style={{
        display: "flex", gap: "2px", background: theme.colors.bg.tertiary,
        borderRadius: "8px", padding: "4px", overflow: "auto",
      }}
    >
      {TIMELINE_SECTIONS.map((s) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={activeSection === s.id}
          tabIndex={activeSection === s.id ? 0 : -1}
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
          <div style={{ fontSize: "16px" }} aria-hidden="true">{s.icon}</div>
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
