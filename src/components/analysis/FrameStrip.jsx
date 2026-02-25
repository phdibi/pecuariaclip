import { theme } from '../../styles/theme';
import QualityBadge from './QualityBadge';

export default function FrameStrip({ frames, analysis, bestFrameIndices }) {
  if (!frames || frames.length === 0) return null;

  const bestSet = new Set(bestFrameIndices || []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{
        fontFamily: theme.fonts.heading, fontSize: '12px',
        letterSpacing: '2px', color: theme.colors.text.dim,
      }}>
        FRAMES ANALISADOS ({frames.length})
      </div>
      <div style={{
        display: 'flex', gap: '4px', overflowX: 'auto',
        paddingBottom: '6px',
      }}>
        {frames.map((frame, i) => {
          const result = analysis?.[i];
          const isBest = bestSet.has(i);

          return (
            <div key={i} style={{
              flexShrink: 0, width: '80px', position: 'relative',
              border: isBest
                ? `2px solid ${theme.colors.green.primary}`
                : `1px solid ${theme.colors.border.primary}`,
              borderRadius: '4px', overflow: 'hidden',
              opacity: result && result.metrics.overall < 25 ? 0.5 : 1,
            }}>
              <img
                src={frame.dataUrl}
                alt={`Frame ${i}`}
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
              />
              {/* Quality score badge */}
              {result && (
                <div style={{ position: 'absolute', bottom: 2, right: 2 }}>
                  <QualityBadge score={result.metrics.overall} size="small" />
                </div>
              )}
              {/* Best frame star */}
              {isBest && (
                <div style={{
                  position: 'absolute', top: 1, left: 2,
                  fontSize: '10px', lineHeight: 1,
                }}>
                  ★
                </div>
              )}
              {/* Time label */}
              <div style={{
                position: 'absolute', top: 1, right: 2,
                fontFamily: theme.fonts.body, fontSize: '8px',
                color: '#fff', background: 'rgba(0,0,0,0.6)',
                padding: '0 3px', borderRadius: '2px',
              }}>
                {frame.time.toFixed(1)}s
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
