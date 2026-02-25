import { theme } from '../../styles/theme';
import { formatDuration } from '../../lib/video-utils';

export default function TimelineTrack({ track, totalTimelineDuration, onClipSelect, selectedClipId }) {
  const scale = totalTimelineDuration > 0 ? 100 / totalTimelineDuration : 1;

  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: '0',
      minHeight: '56px', marginBottom: '4px',
    }}>
      {/* Section label */}
      <div style={{
        width: '120px', flexShrink: 0, padding: '6px 8px',
        background: theme.colors.bg.tertiary,
        borderLeft: `3px solid ${track.color}`,
        borderRadius: '4px 0 0 4px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: '11px',
          letterSpacing: '1.5px', color: track.color,
        }}>
          {track.icon} {track.label}
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '9px',
          color: theme.colors.text.dim, marginTop: '1px',
        }}>
          {track.totalDuration > 0
            ? formatDuration(track.totalDuration)
            : 'Sem clips'}
        </div>
      </div>

      {/* Clips area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        background: theme.colors.bg.tertiary,
        borderRadius: '0 4px 4px 0',
        padding: '4px 6px', gap: '2px',
        position: 'relative', overflow: 'hidden',
      }}>
        {track.clips.length === 0 ? (
          <div style={{
            fontFamily: theme.fonts.body, fontSize: '10px',
            color: theme.colors.text.dim, fontStyle: 'italic',
            padding: '4px',
          }}>
            Nenhum vídeo nesta seção
          </div>
        ) : (
          track.clips.map((clip) => {
            const widthPct = Math.max(3, clip.duration * scale);
            const isSelected = clip.id === selectedClipId;

            return (
              <div
                key={clip.id}
                onClick={() => onClipSelect?.(clip)}
                style={{
                  width: `${widthPct}%`, minWidth: '40px',
                  height: '44px', borderRadius: '4px',
                  background: isSelected
                    ? `linear-gradient(135deg, ${track.color}66, ${track.color}33)`
                    : `linear-gradient(135deg, ${track.color}33, ${track.color}11)`,
                  border: isSelected
                    ? `2px solid ${track.color}`
                    : `1px solid ${track.color}44`,
                  cursor: 'pointer', overflow: 'hidden',
                  position: 'relative',
                  display: 'flex', alignItems: 'center', padding: '0 6px',
                  transition: 'all 0.15s',
                }}
              >
                {/* Thumbnail */}
                {clip.thumbnailUrl && (
                  <img
                    src={clip.thumbnailUrl}
                    alt=""
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', opacity: 0.3,
                    }}
                  />
                )}
                {/* Clip info */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontFamily: theme.fonts.body, fontSize: '9px',
                    color: '#fff', fontWeight: 500,
                    whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis', maxWidth: '100px',
                  }}>
                    {clip.uploadFileName}
                  </div>
                  <div style={{
                    fontFamily: theme.fonts.heading, fontSize: '10px',
                    color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px',
                  }}>
                    {formatDuration(clip.duration)}
                  </div>
                </div>

                {/* Transition indicator */}
                {clip.transition === 'dissolve' && (
                  <div style={{
                    position: 'absolute', right: 0, top: 0, bottom: 0,
                    width: '8px',
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2))',
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
