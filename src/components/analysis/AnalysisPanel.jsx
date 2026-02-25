import { theme } from '../../styles/theme';
import QualityBadge from './QualityBadge';
import FrameStrip from './FrameStrip';

export default function AnalysisPanel({ status, progress, frames, analysis, bestFrames, error }) {
  if (status === 'idle') return null;

  if (status === 'extracting' || status === 'analyzing') {
    const pct = progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

    return (
      <div style={{
        padding: '10px 12px',
        background: theme.colors.gold.subtle,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '6px', marginTop: '8px',
      }}>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '11px',
          color: theme.colors.text.muted, marginBottom: '6px',
        }}>
          {progress.step}... ({progress.current}/{progress.total})
        </div>
        <div style={{
          height: '4px', background: theme.colors.border.subtle,
          borderRadius: '2px', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: '2px', width: `${pct}%`,
            background: `linear-gradient(90deg, ${theme.colors.gold.dark}, ${theme.colors.gold.primary})`,
            transition: 'width 0.2s',
          }} />
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        padding: '8px 12px',
        background: 'rgba(139,0,0,0.1)',
        border: '1px solid rgba(139,0,0,0.3)',
        borderRadius: '6px', marginTop: '8px',
        fontFamily: theme.fonts.body, fontSize: '11px', color: '#8B0000',
      }}>
        Erro na análise: {error}
      </div>
    );
  }

  if (status === 'done' && analysis) {
    // Calculate average score
    const avgScore = analysis.length > 0
      ? Math.round(analysis.reduce((sum, a) => sum + a.metrics.overall, 0) / analysis.length)
      : 0;

    const bestIndices = bestFrames.map(bf => bf.index);

    return (
      <div style={{
        padding: '12px',
        background: theme.colors.bg.tertiary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '6px', marginTop: '8px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        {/* Summary bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            fontFamily: theme.fonts.heading, fontSize: '12px',
            letterSpacing: '1px', color: theme.colors.text.dim,
          }}>
            ANÁLISE CONCLUÍDA
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{
              fontFamily: theme.fonts.body, fontSize: '10px',
              color: theme.colors.text.muted,
            }}>
              Score médio:
            </span>
            <QualityBadge score={avgScore} size="medium" />
          </div>
          <div style={{
            fontFamily: theme.fonts.body, fontSize: '10px',
            color: theme.colors.green.primary,
          }}>
            ★ {bestFrames.length} melhores frames selecionados para IA
          </div>
        </div>

        {/* Frame strip */}
        <FrameStrip
          frames={frames}
          analysis={analysis}
          bestFrameIndices={bestIndices}
        />
      </div>
    );
  }

  return null;
}
