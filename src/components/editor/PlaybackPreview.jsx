import { useRef, useState, useCallback, useEffect, memo } from 'react';
import { theme } from '../../styles/theme';
import { formatDuration } from '../../lib/video-utils';

function PlaybackPreview({ flatClips, overlayComponent }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  // Use ref for high-frequency time updates (avoids 60fps re-renders)
  const currentTimeRef = useRef(0);
  const [displayTime, setDisplayTime] = useState(0);
  const rafRef = useRef(null);
  const [totalDuration, setTotalDuration] = useState(0);

  const currentClip = flatClips?.[currentClipIndex];

  useEffect(() => {
    if (flatClips?.length > 0) {
      const total = flatClips[flatClips.length - 1]?.endInTimeline || 0;
      setTotalDuration(total);
    }
  }, [flatClips]);

  // Load current clip into video element
  useEffect(() => {
    if (!currentClip || !videoRef.current) return;
    const video = videoRef.current;

    if (video.src !== currentClip.localUrl) {
      video.src = currentClip.localUrl;
    }
    video.currentTime = currentClip.inPoint;
  }, [currentClip]);

  // Throttled display time update (4fps instead of 60fps)
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setDisplayTime(currentTimeRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [playing]);

  // Monitor playback to respect out-point
  const onTimeUpdate = useCallback(() => {
    if (!currentClip || !videoRef.current) return;
    const video = videoRef.current;

    const clipTime = video.currentTime - currentClip.inPoint;
    currentTimeRef.current = currentClip.startInTimeline + clipTime;

    if (video.currentTime >= currentClip.outPoint) {
      // Move to next clip
      if (currentClipIndex < flatClips.length - 1) {
        setCurrentClipIndex(prev => prev + 1);
      } else {
        // End of video
        video.pause();
        setPlaying(false);
        setCurrentClipIndex(0);
        currentTimeRef.current = 0;
        setDisplayTime(0);
      }
    }
  }, [currentClip, currentClipIndex, flatClips]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current || !currentClip) return;

    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
      setDisplayTime(currentTimeRef.current);
    } else {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [playing, currentClip]);

  const seek = useCallback((clipIndex) => {
    setCurrentClipIndex(clipIndex);
    setPlaying(false);
    if (flatClips[clipIndex]) {
      currentTimeRef.current = flatClips[clipIndex].startInTimeline;
      setDisplayTime(flatClips[clipIndex].startInTimeline);
    }
  }, [flatClips]);

  if (!flatClips || flatClips.length === 0) {
    return (
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: '#000', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${theme.colors.border.primary}`,
      }}>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '13px',
          color: theme.colors.text.dim, textAlign: 'center',
        }}>
          Nenhum clip na timeline.
          <br />
          Faça upload de vídeos e gere o plano de edição.
        </div>
      </div>
    );
  }

  const progressPct = totalDuration > 0 ? (displayTime / totalDuration) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Video container */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        background: '#000', borderRadius: '8px',
        position: 'relative', overflow: 'hidden',
        border: `1px solid ${theme.colors.border.primary}`,
      }}>
        <video
          ref={videoRef}
          onTimeUpdate={onTimeUpdate}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          playsInline
          muted
        />

        {/* Overlay (optional) */}
        {overlayComponent && (
          <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
          }}>
            {overlayComponent}
          </div>
        )}

        {/* Section indicator */}
        {currentClip && (
          <div style={{
            position: 'absolute', top: 8, left: 8,
            background: `${currentClip.sectionColor}CC`, padding: '2px 10px',
            borderRadius: '4px', fontFamily: theme.fonts.heading,
            fontSize: '11px', color: '#fff', letterSpacing: '1px',
          }}>
            {currentClip.sectionId.toUpperCase()}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '6px 10px',
        background: theme.colors.bg.tertiary,
        borderRadius: '6px',
      }}>
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pausar' : 'Reproduzir'}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: theme.colors.gold.primary, border: 'none',
            color: '#000', fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>

        {/* Time display */}
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: '14px',
          color: theme.colors.text.primary, letterSpacing: '1px',
        }}>
          {formatDuration(displayTime)}
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '10px',
          color: theme.colors.text.dim,
        }}>
          / {formatDuration(totalDuration)}
        </div>

        {/* Progress bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            flex: 1, height: '6px',
            background: theme.colors.border.subtle,
            borderRadius: '3px', overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div style={{
            height: '100%', borderRadius: '3px',
            width: `${progressPct}%`,
            background: `linear-gradient(90deg, ${theme.colors.gold.dark}, ${theme.colors.gold.primary})`,
            transition: 'width 0.1s',
          }} />
        </div>

        {/* Clip counter */}
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '10px',
          color: theme.colors.text.dim,
        }}>
          Clip {currentClipIndex + 1}/{flatClips.length}
        </div>
      </div>

      {/* Clip thumbnails strip */}
      <div style={{
        display: 'flex', gap: '3px', overflowX: 'auto',
        paddingBottom: '4px',
      }}>
        {flatClips.map((clip, i) => (
          <div
            key={clip.id}
            onClick={() => seek(i)}
            role="button"
            tabIndex={0}
            aria-label={`Clip ${i + 1}: ${clip.uploadFileName}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seek(i); } }}
            style={{
              flexShrink: 0, width: '50px', height: '30px',
              borderRadius: '3px', overflow: 'hidden', cursor: 'pointer',
              border: i === currentClipIndex
                ? `2px solid ${clip.sectionColor}`
                : `1px solid ${theme.colors.border.primary}`,
              opacity: i === currentClipIndex ? 1 : 0.6,
            }}
          >
            {clip.thumbnailUrl ? (
              <img src={clip.thumbnailUrl} alt={`Clip ${i + 1}`} style={{
                width: '100%', height: '100%', objectFit: 'cover',
              }} />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: `${clip.sectionColor}33`,
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(PlaybackPreview);
