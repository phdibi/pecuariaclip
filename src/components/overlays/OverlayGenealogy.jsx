import { memo } from 'react';
import { theme } from '../../styles/theme';

function OverlayGenealogy({ data }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16/9", background: "#0A0805",
      borderRadius: "8px", position: "relative", overflow: "hidden",
      border: `1px solid ${theme.colors.border.primary}`,
      padding: "20px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        fontFamily: theme.fonts.heading, fontSize: "18px", letterSpacing: "4px",
        color: theme.colors.gold.primary, marginBottom: "16px",
      }}>
        GENEALOGIA
      </div>

      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "10px", width: "100%",
      }}>
        {/* Animal */}
        <div style={{
          background: `linear-gradient(135deg, ${theme.colors.gold.primary}, #8B6914)`,
          padding: "8px 24px", borderRadius: "6px", textAlign: "center",
        }}>
          <div style={{
            fontFamily: theme.fonts.display,
            fontSize: "clamp(12px, 2.5vw, 18px)",
            fontWeight: 900, color: "#0A0805",
          }}>
            {data.name || "NOME DO ANIMAL"}
          </div>
        </div>

        <div style={{ width: "2px", height: "12px", background: theme.colors.border.secondary }} />

        {/* Parents */}
        <div style={{
          display: "flex", gap: "30px", width: "100%", justifyContent: "center",
        }}>
          {[
            { label: "PAI", name: data.sire || "TOURO PAI", grandpa: data.sireSire || "AVÔ PATERNO" },
            { label: "MÃE", name: data.dam || "VACA MÃE", grandpa: data.damSire || "AVÔ MATERNO" },
          ].map((p, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
            }}>
              <div style={{
                border: `1px solid ${theme.colors.border.secondary}`,
                padding: "6px 16px", borderRadius: "6px",
                textAlign: "center", background: "rgba(26,21,16,0.8)",
              }}>
                <div style={{
                  fontFamily: theme.fonts.body, fontSize: "8px",
                  color: theme.colors.text.muted, letterSpacing: "2px", marginBottom: "2px",
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontFamily: theme.fonts.display,
                  fontSize: "clamp(10px, 2vw, 14px)",
                  fontWeight: 700, color: theme.colors.text.primary,
                }}>
                  {p.name}
                </div>
              </div>
              <div style={{ width: "1px", height: "8px", background: theme.colors.border.secondary }} />
              <div style={{
                border: `1px solid ${theme.colors.border.primary}`,
                padding: "4px 12px", borderRadius: "4px",
                textAlign: "center", background: "rgba(26,21,16,0.5)",
              }}>
                <div style={{
                  fontFamily: theme.fonts.body, fontSize: "7px",
                  color: "#6B5740", letterSpacing: "1px",
                }}>
                  AVÔ
                </div>
                <div style={{
                  fontFamily: theme.fonts.body, fontSize: "clamp(9px, 1.5vw, 11px)",
                  fontWeight: 500, color: theme.colors.text.muted,
                }}>
                  {p.grandpa}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(OverlayGenealogy);
