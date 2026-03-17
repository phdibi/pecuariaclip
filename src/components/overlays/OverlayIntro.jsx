import { memo } from 'react';
import { theme } from '../../styles/theme';

function OverlayIntro({ data }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9",
      background: "linear-gradient(135deg, #0A0805 0%, #1A1208 40%, #0A0805 100%)",
      borderRadius: "8px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden", border: `1px solid ${theme.colors.border.primary}`,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(184,134,11,0.15) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "300px", height: "300px",
        border: "1px solid rgba(184,134,11,0.1)",
        borderRadius: "50%", animation: "pulse 3s ease-in-out infinite",
      }} />
      <div style={{
        fontFamily: theme.fonts.display, fontSize: "clamp(16px, 4vw, 36px)",
        fontWeight: 900, color: theme.colors.gold.primary, letterSpacing: "6px",
        textAlign: "center", zIndex: 1,
        textShadow: "0 0 40px rgba(184,134,11,0.3)",
      }}>
        {data.farmName || "FAZENDA EXEMPLO"}
      </div>
      <div style={{
        width: "60px", height: "2px",
        background: `linear-gradient(90deg, transparent, ${theme.colors.gold.primary}, transparent)`,
        margin: "12px 0", zIndex: 1,
      }} />
      <div style={{
        fontFamily: theme.fonts.body, fontSize: "clamp(9px, 1.5vw, 13px)",
        color: theme.colors.text.muted, letterSpacing: "4px",
        textTransform: "uppercase", zIndex: 1,
      }}>
        GENÉTICA DE EXCELÊNCIA
      </div>
    </div>
  );
}

export default memo(OverlayIntro);
