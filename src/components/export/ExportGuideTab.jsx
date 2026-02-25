import { theme } from '../../styles/theme';

export default function ExportGuideTab() {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.colors.gold.muted} 0%, transparent 60%)`,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: "10px", padding: "16px 20px",
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: "18px", letterSpacing: "3px",
          color: theme.colors.gold.primary, marginBottom: "4px",
        }}>
          GUIA DE EDIÇÃO E EXPORTAÇÃO
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: "12px", color: theme.colors.text.muted,
        }}>
          Siga este passo-a-passo para montar seu vídeo profissional usando os gráficos gerados.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Video Settings */}
        <div style={{
          background: theme.colors.bg.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: "8px", padding: "16px",
        }}>
          <div style={{
            fontFamily: theme.fonts.heading, fontSize: "16px", letterSpacing: "2px",
            color: theme.colors.gold.primary, marginBottom: "12px",
          }}>
            CONFIGURAÇÕES DE VÍDEO
          </div>
          {[
            { label: "Resolução", value: "1920 × 1080 (Full HD) ou 3840 × 2160 (4K)" },
            { label: "Proporção", value: "16:9 (paisagem) — padrão YouTube" },
            { label: "FPS", value: "30 fps (padrão) ou 60 fps (slow motion)" },
            { label: "Codec", value: "H.264 / H.265 — compatível com todas plataformas" },
            { label: "Bitrate", value: "10-15 Mbps para Full HD / 35-50 Mbps para 4K" },
            { label: "Duração ideal", value: "60 a 90 segundos por animal" },
            { label: "Formato final", value: ".MP4 (mais compatível)" },
          ].map((item, i, arr) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "6px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${theme.colors.border.subtle}` : "none",
            }}>
              <span style={{ fontSize: "12px", color: theme.colors.text.muted }}>{item.label}</span>
              <span style={{ fontSize: "12px", color: theme.colors.text.secondary, fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* Recommended Apps */}
        <div style={{
          background: theme.colors.bg.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: "8px", padding: "16px",
        }}>
          <div style={{
            fontFamily: theme.fonts.heading, fontSize: "16px", letterSpacing: "2px",
            color: theme.colors.gold.primary, marginBottom: "12px",
          }}>
            APPS DE EDIÇÃO RECOMENDADOS
          </div>
          {[
            { name: "CapCut", tier: "GRATUITO", desc: "Melhor custo-benefício. Templates prontos, textos, transições. Ideal para celular." },
            { name: "VN Video Editor", tier: "GRATUITO", desc: "Poderoso e sem marca d'água. Bom controle de camadas e keyframes." },
            { name: "InShot", tier: "FREEMIUM", desc: "Simples e intuitivo. Bom para vídeos rápidos com textos sobrepostos." },
            { name: "DaVinci Resolve", tier: "GRÁTIS/PRO", desc: "Profissional nível cinema. Melhor opção para desktop. Cor e áudio excepcionais." },
            { name: "Adobe Premiere Rush", tier: "PAGO", desc: "Versão simplificada do Premiere. Sync entre celular e desktop." },
          ].map((app, i) => (
            <div key={i} style={{
              padding: "8px", borderRadius: "6px", marginBottom: "6px",
              background: theme.colors.gold.subtle,
              border: `1px solid ${theme.colors.border.subtle}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontFamily: theme.fonts.body, fontSize: "13px",
                  fontWeight: 700, color: theme.colors.text.primary,
                }}>
                  {app.name}
                </span>
                <span style={{
                  fontFamily: theme.fonts.heading, fontSize: "10px", letterSpacing: "1px",
                  color: app.tier === "GRATUITO" ? theme.colors.green.primary : theme.colors.gold.primary,
                  background: app.tier === "GRATUITO" ? "rgba(107,142,35,0.15)" : "rgba(184,134,11,0.15)",
                  padding: "2px 8px", borderRadius: "3px",
                }}>
                  {app.tier}
                </span>
              </div>
              <div style={{
                fontFamily: theme.fonts.body, fontSize: "11px",
                color: theme.colors.text.muted, marginTop: "3px",
              }}>
                {app.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step by Step */}
      <div style={{
        background: theme.colors.bg.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: "8px", padding: "16px",
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: "16px", letterSpacing: "2px",
          color: theme.colors.gold.primary, marginBottom: "12px",
        }}>
          PASSO A PASSO PARA MONTAR O VÍDEO
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {[
            { step: "01", title: "GRAVE", items: ["Siga o storyboard seção por seção", "Filme cada ângulo com pelo menos 10s", "Use tripé ou gimbal para estabilidade", "Luz natural: manhã cedo ou fim de tarde"] },
            { step: "02", title: "IMPORTE", items: ["Transfira os vídeos para o app de edição", "Organize por seção (intro, hero, ângulos...)", "Selecione os melhores takes de cada seção", "Corte partes tremidas ou com ruído"] },
            { step: "03", title: "MONTE", items: ["Siga a timeline: Intro → Hero → Ângulos → Detalhes → Dados → Genealogia → CTA", "Adicione os overlays gerados neste app", "Insira trilha sonora (música livre de direitos)", "Exporte em MP4 Full HD para YouTube"] },
          ].map((step, i) => (
            <div key={i} style={{
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: "8px", padding: "14px",
              background: theme.colors.gold.subtle,
            }}>
              <div style={{
                fontFamily: theme.fonts.heading, fontSize: "36px",
                color: "rgba(184,134,11,0.2)", lineHeight: 1,
              }}>
                {step.step}
              </div>
              <div style={{
                fontFamily: theme.fonts.heading, fontSize: "18px",
                letterSpacing: "2px", color: theme.colors.gold.primary, marginBottom: "8px",
              }}>
                {step.title}
              </div>
              {step.items.map((item, j, arr) => (
                <div key={j} style={{
                  fontFamily: theme.fonts.body, fontSize: "11px",
                  color: theme.colors.text.muted, padding: "4px 0",
                  borderBottom: j < arr.length - 1 ? `1px solid ${theme.colors.border.subtle}` : "none",
                  lineHeight: 1.4,
                }}>
                  → {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* SEO Tips */}
      <div style={{
        background: "linear-gradient(135deg, rgba(107,142,35,0.1) 0%, transparent 60%)",
        border: "1px solid rgba(107,142,35,0.3)",
        borderRadius: "10px", padding: "16px 20px",
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: "16px", letterSpacing: "2px",
          color: theme.colors.green.primary, marginBottom: "6px",
        }}>
          DICA PRO — YOUTUBE SEO PARA PECUÁRIA
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: "12px",
          color: theme.colors.text.muted, lineHeight: 1.6,
        }}>
          <strong style={{ color: theme.colors.green.primary }}>Título:</strong> "[NOME DO TOURO] — [RAÇA] [SAFRA] | [Nome da Fazenda] | TOP [X]% [Programa]"
          <br />
          <strong style={{ color: theme.colors.green.primary }}>Descrição:</strong> Inclua todas as DEPs, genealogia, peso, CE, contato WhatsApp e link para catálogo.
          <br />
          <strong style={{ color: theme.colors.green.primary }}>Tags:</strong> touro nelore, nelore PO, leilão, reprodutor, pecuária, CEIP, genética bovina, [sua cidade/estado]
          <br />
          <strong style={{ color: theme.colors.green.primary }}>Thumbnail:</strong> Foto lateral do animal com nome em fonte grande + badge "TOP 1%"
        </div>
      </div>
    </div>
  );
}
