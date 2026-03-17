import { memo } from 'react';
import { theme } from '../../styles/theme';
import { formatDuration, formatFileSize } from '../../lib/video-utils';

function VideoThumbnail({ upload, onRemove }) {
  return (
    <div style={{
      background: theme.colors.bg.tertiary,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '8px', overflow: 'hidden',
      position: 'relative', width: '160px', flexShrink: 0,
    }}>
      {/* Thumbnail image */}
      <div style={{
        width: '100%', aspectRatio: '16/9', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {upload.thumbnailUrl ? (
          <img
            src={upload.thumbnailUrl}
            alt={upload.fileName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{
            fontFamily: theme.fonts.body, fontSize: '10px',
            color: theme.colors.text.dim,
          }}>
            Sem preview
          </span>
        )}
        {/* Duration badge */}
        {upload.duration && (
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            background: 'rgba(0,0,0,0.8)', padding: '1px 6px',
            borderRadius: '3px', fontFamily: theme.fonts.heading,
            fontSize: '11px', color: '#fff', letterSpacing: '1px',
          }}>
            {formatDuration(upload.duration)}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '6px 8px' }}>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '11px',
          color: theme.colors.text.secondary, fontWeight: 500,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {upload.fileName}
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '9px',
          color: theme.colors.text.dim, marginTop: '2px',
          display: 'flex', gap: '6px',
        }}>
          {upload.resolution && (
            <span>{upload.resolution.width}x{upload.resolution.height}</span>
          )}
          {upload.fileSize && (
            <span>{formatFileSize(upload.fileSize)}</span>
          )}
        </div>
      </div>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(upload.id); }}
          style={{
            position: 'absolute', top: 4, right: 4,
            width: '20px', height: '20px', borderRadius: '50%',
            background: 'rgba(139,0,0,0.8)', border: 'none',
            color: '#fff', fontSize: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}
          title="Remover vídeo"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default memo(VideoThumbnail);
