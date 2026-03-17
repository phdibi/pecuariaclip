import { memo } from 'react';
import { theme } from '../../styles/theme';

function OverlayDeps({ data }) {
  const deps = [
    { label: "Peso Nascimento", value: data.depPN || "+0.8", pct: 35 },
    { label: "Peso Desmama", value: data.depPD || "+18.5", pct: 78 },
    { label: "Peso Sobreano", value: data.depPS || "+25.3", pct: 82 },
    { label: "Hab. Materna", value: data.depHM || "+12.1", pct: 70 },
    { label: "Área Olho Lombo", value: data.depAOL || "+3.2", pct: 65 },
    { label: "Acab. Carcaça", value: data.depAC || "+1.5", pct: 55 },
  ];

  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", background: "#0A0805",
      borderRadius: "8px", position: "relative", overflow: "hidden",
      border: `1px solid ${theme.colors.border.primary}`,
      padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 80% 50%, rgba(184,134,11,0.08) 0%, transparent 60%)",
      }} />
      <div style={{
        fontFamily: theme.fonts.heading, fontSize: "18px", letterSpacing: "4px",
        color: theme.colors.gold.primary, marginBottom: "14px",
      }}>
        AVALIAÇÃO GENÉTICA — DEPs
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {deps.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              width: "120px", fontFamily: theme.fonts.body, fontSize: "10px",
              color: theme.colors.text.muted, letterSpacing: "0.5px",
              textTransform: "uppercase", flexShrink: 0,
            }}>
              {d.label}
            </span>
            <div style={{
              flex: 1, height: "6px", background: theme.colors.bg.card,
              borderRadius: "3px", overflow: "hidden",
            }}>
              <div style={{
                width: `${d.pct}%`, height: "100%", borderRadius: "3px",
                background: `linear-gradient(90deg, ${theme.colors.gold.dark}, ${theme.colors.gold.primary})`,
                transition: "width 1s ease",
              }} />
            </div>
            <span style={{
              fontFamily: theme.fonts.heading, fontSize: "16px",
              color: theme.colors.text.primary, width: "50px", textAlign: "right",
            }}>
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(OverlayDeps);
