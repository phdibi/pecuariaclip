import { TIMELINE_SECTIONS } from '../../constants/timeline-sections';
import { useProjectStore } from '../../hooks/useProjectStore';
import SectionUploadZone from './SectionUploadZone';
import { theme } from '../../styles/theme';

export default function UploadTab() {
  const sections = useProjectStore(s => s.sections);

  const totalUploads = Object.values(sections).reduce(
    (sum, sec) => sum + sec.uploads.length, 0
  );
  const sectionsWithUploads = Object.values(sections).filter(
    sec => sec.uploads.length > 0
  ).length;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header banner */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.colors.gold.muted} 0%, transparent 60%)`,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '10px', padding: '16px 20px',
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: '20px',
          letterSpacing: '3px', color: theme.colors.gold.primary, marginBottom: '6px',
        }}>
          UPLOAD DE VÍDEOS BRUTOS
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '12px',
          color: theme.colors.text.muted, lineHeight: 1.6,
        }}>
          Faça upload dos seus takes brutos (sem cortes) organizados por seção do storyboard.
          A IA irá analisar cada vídeo, identificar os melhores momentos e sugerir os cortes automaticamente.
          <strong style={{ color: theme.colors.gold.primary }}> Filme bastante — quanto mais material, melhor o resultado final.</strong>
        </div>
      </div>

      {/* Summary bar */}
      <div style={{
        display: 'flex', gap: '16px', alignItems: 'center',
        padding: '10px 16px',
        background: theme.colors.bg.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontFamily: theme.fonts.heading, fontSize: '28px',
            color: totalUploads > 0 ? theme.colors.gold.primary : theme.colors.text.dim,
          }}>
            {totalUploads}
          </span>
          <span style={{
            fontFamily: theme.fonts.body, fontSize: '11px',
            color: theme.colors.text.muted, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            {totalUploads === 1 ? 'vídeo' : 'vídeos'} importados
          </span>
        </div>
        <div style={{
          width: '1px', height: '20px', background: theme.colors.border.primary,
        }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontFamily: theme.fonts.heading, fontSize: '28px',
            color: sectionsWithUploads > 0 ? theme.colors.green.primary : theme.colors.text.dim,
          }}>
            {sectionsWithUploads}
          </span>
          <span style={{
            fontFamily: theme.fonts.body, fontSize: '11px',
            color: theme.colors.text.muted, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            de {TIMELINE_SECTIONS.length} seções
          </span>
        </div>
        {totalUploads > 0 && (
          <>
            <div style={{ flex: 1 }} />
            <div style={{
              fontFamily: theme.fonts.heading, fontSize: '12px',
              letterSpacing: '1px',
              color: sectionsWithUploads >= 3 ? theme.colors.green.primary : theme.colors.text.dim,
            }}>
              {sectionsWithUploads >= 5
                ? 'PRONTO PARA ANÁLISE DA IA'
                : sectionsWithUploads >= 3
                  ? 'BOM PROGRESSO — CONTINUE ADICIONANDO'
                  : 'ADICIONE MAIS SEÇÕES'
              }
            </div>
          </>
        )}
      </div>

      {/* Upload zones per section */}
      {TIMELINE_SECTIONS.map(section => (
        <SectionUploadZone key={section.id} sectionId={section.id} />
      ))}
    </div>
  );
}
