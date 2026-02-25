import { useState } from 'react';
import TimelineBar from './TimelineBar';
import ShootingGuide from './ShootingGuide';
import OverlayPreview from '../overlays/OverlayPreview';
import { OVERLAY_MAP } from '../../constants/timeline-sections';
import { theme } from '../../styles/theme';

export default function StoryboardTab({ data }) {
  const [activeSection, setActiveSection] = useState("intro");

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{
        background: `linear-gradient(135deg, ${theme.colors.gold.muted} 0%, transparent 60%)`,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: "10px", padding: "16px 20px",
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: "20px", letterSpacing: "3px",
          color: theme.colors.gold.primary, marginBottom: "6px",
        }}>
          PADRÃO PROFISSIONAL DE VÍDEO — LEILÃO / YOUTUBE
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: "12px",
          color: theme.colors.text.muted, lineHeight: 1.6,
        }}>
          Baseado na análise de centenas de vídeos profissionais de leilões como Canal Rural, Lance Rural, Canal do Boi e criatórios de elite.
          O formato padrão tem entre <strong style={{ color: theme.colors.gold.primary }}>60-90 segundos</strong> e segue a estrutura abaixo.
          Clique em cada seção para ver o guia de filmagem detalhado.
        </div>
      </div>

      <TimelineBar activeSection={activeSection} setActiveSection={setActiveSection} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <ShootingGuide sectionId={activeSection} />
        <div>
          <div style={{
            fontFamily: theme.fonts.heading, fontSize: "14px", letterSpacing: "2px",
            color: theme.colors.text.dim, marginBottom: "8px",
          }}>
            PREVIEW DO OVERLAY
          </div>
          <OverlayPreview data={data} overlayType={OVERLAY_MAP[activeSection]} />
        </div>
      </div>

      {/* Music recommendations */}
      <div style={{
        background: theme.colors.bg.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: "8px", padding: "16px",
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: "16px", letterSpacing: "2px",
          color: theme.colors.gold.primary, marginBottom: "10px",
        }}>
          TRILHA SONORA RECOMENDADA
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {[
            { style: "Sertanejo Raiz Instrumental", desc: "Viola caipira, ritmo calmo. Transmite tradição e confiança.", fit: "Fazendas tradicionais" },
            { style: "Country/Western Épico", desc: "Batidas fortes, guitarra. Dramático e imponente.", fit: "Leilões de elite" },
            { style: "Orquestral Cinematográfico", desc: "Cordas, crescendo. Sensação de grandeza e sofisticação.", fit: "Touros recordistas" },
          ].map((m, i) => (
            <div key={i} style={{
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: "6px", padding: "10px",
              background: theme.colors.gold.subtle,
            }}>
              <div style={{
                fontFamily: theme.fonts.body, fontSize: "12px",
                fontWeight: 700, color: theme.colors.text.secondary, marginBottom: "4px",
              }}>
                {m.style}
              </div>
              <div style={{
                fontFamily: theme.fonts.body, fontSize: "11px",
                color: theme.colors.text.muted, lineHeight: 1.4, marginBottom: "6px",
              }}>
                {m.desc}
              </div>
              <div style={{
                fontFamily: theme.fonts.body, fontSize: "9px",
                color: theme.colors.text.dim, letterSpacing: "1px", textTransform: "uppercase",
              }}>
                Ideal para: {m.fit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
