import { theme } from '../../styles/theme';

export default function OverlayCta({ data }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9",
      background: "linear-gradient(135deg, #0A0805 0%, #1A1208 100%)",
      borderRadius: "8px", position: "relative", overflow: "hidden",
      border: `1px solid ${theme.colors.border.primary}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "20px",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, rgba(184,134,11,0.1) 0%, transparent 70%)",
      }} />

      {data.auctionName && (
        <div style={{
          fontFamily: theme.fonts.heading,
          fontSize: "clamp(12px, 3vw, 22px)", letterSpacing: "4px",
          color: theme.colors.gold.primary, marginBottom: "4px", zIndex: 1,
        }}>
          {data.auctionName}
        </div>
      )}

      {data.auctionDate && (
        <div style={{
          fontFamily: theme.fonts.display,
          fontSize: "clamp(18px, 5vw, 36px)", fontWeight: 900,
          color: theme.colors.gold.light, zIndex: 1, marginBottom: "8px",
        }}>
          {data.auctionDate}
        </div>
      )}

      <div style={{
        width: "60px", height: "2px",
        background: `linear-gradient(90deg, transparent, ${theme.colors.gold.primary}, transparent)`,
        margin: "8px 0", zIndex: 1,
      }} />

      <div style={{
        fontFamily: theme.fonts.display,
        fontSize: "clamp(14px, 3vw, 24px)", fontWeight: 700,
        color: theme.colors.text.primary, zIndex: 1, marginBottom: "4px",
      }}>
        {data.farmName || "FAZENDA EXEMPLO"}
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        zIndex: 1, marginTop: "8px",
      }}>
        <div style={{
          background: theme.colors.green.whatsapp, color: "#fff",
          padding: "6px 16px", borderRadius: "20px",
          fontFamily: theme.fonts.body,
          fontSize: "clamp(10px, 1.5vw, 14px)", fontWeight: 700,
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          📱 {data.whatsapp || "(00) 00000-0000"}
        </div>
      </div>
    </div>
  );
}
