import OverlayPreview from './OverlayPreview';
import { theme } from '../../styles/theme';

const OVERLAY_LIST = [
  { type: "intro", label: "01 — INTRO / ABERTURA" },
  { type: "datacard", label: "02 — FICHA DO ANIMAL (LOWER THIRD)" },
  { type: "deps", label: "03 — DEPs / AVALIAÇÃO GENÉTICA" },
  { type: "genealogy", label: "04 — ÁRVORE GENEALÓGICA" },
  { type: "cta", label: "05 — TELA DE CONTATO / CTA" },
];

export default function OverlaysTab({ data }) {
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
          GRÁFICOS E OVERLAYS DO SEU VÍDEO
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: "12px", color: theme.colors.text.muted,
        }}>
          Preencha os dados na aba "Dados do Animal" e todos os overlays serão gerados automaticamente.
          Estes são os gráficos que serão sobrepostos ao seu vídeo em cada seção.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {OVERLAY_LIST.map((item, i) => (
          <div key={i} className="slide-in" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
            <div style={{
              fontFamily: theme.fonts.heading, fontSize: "13px", letterSpacing: "2px",
              color: theme.colors.text.dim, marginBottom: "6px",
            }}>
              {item.label}
            </div>
            <OverlayPreview data={data} overlayType={item.type} />
          </div>
        ))}
      </div>
    </div>
  );
}
