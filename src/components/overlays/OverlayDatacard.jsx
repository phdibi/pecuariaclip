import { theme } from '../../styles/theme';

export default function OverlayDatacard({ data }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9",
      background: "linear-gradient(180deg, transparent 40%, rgba(10,8,5,0.85) 60%, rgba(10,8,5,0.95) 100%)",
      borderRadius: "8px", position: "relative", overflow: "hidden",
      border: `1px solid ${theme.colors.border.primary}`,
      display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "20px",
    }}>
      <div style={{
        position: "absolute", top: 12, right: 16,
        display: "flex", alignItems: "center", gap: "8px",
      }}>
        <div style={{
          background: "rgba(184,134,11,0.9)", padding: "4px 14px", borderRadius: "4px",
          fontFamily: theme.fonts.heading, fontSize: "14px",
          color: "#0A0805", letterSpacing: "2px",
        }}>
          {data.top ? `TOP ${data.top}` : "TOP 1%"}
        </div>
      </div>

      <div style={{
        position: "absolute", top: 0, left: 0, width: "4px", height: "100%",
        background: `linear-gradient(180deg, ${theme.colors.gold.primary}, transparent)`,
      }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{
          fontFamily: theme.fonts.display, fontSize: "clamp(18px, 4vw, 32px)",
          fontWeight: 900, color: theme.colors.gold.light, lineHeight: 1, letterSpacing: "1px",
        }}>
          {data.name || "NOME DO ANIMAL"}
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: "clamp(9px, 1.5vw, 12px)",
          color: theme.colors.gold.primary, letterSpacing: "2px", textTransform: "uppercase",
        }}>
          {data.breed || "NELORE PO"} • {data.rgd || "RGD 00000"} • NASC. {data.birthDate || "00/00/0000"}
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
          {[
            { label: "PESO", value: data.weight ? `${data.weight} kg` : "850 kg" },
            { label: "CE", value: data.ce ? `${data.ce} cm` : "39 cm" },
            { label: "iABCZ", value: data.iabcz || "24.35" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column" }}>
              <span style={{
                fontFamily: theme.fonts.body, fontSize: "9px",
                color: theme.colors.text.muted, letterSpacing: "1.5px",
              }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: theme.fonts.heading, fontSize: "clamp(16px, 3vw, 24px)",
                color: theme.colors.text.primary, letterSpacing: "1px",
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute", bottom: 12, right: 16,
        fontFamily: theme.fonts.body, fontSize: "10px",
        color: theme.colors.text.dim, letterSpacing: "1px",
      }}>
        {data.farmName || "FAZENDA EXEMPLO"}
      </div>
    </div>
  );
}
