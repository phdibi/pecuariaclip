import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { theme } from '../../styles/theme';
import { TIMELINE_SECTIONS } from '../../constants/timeline-sections';
import { SHOOTING_TIPS } from '../../constants/shooting-tips';
import { validateVideoFile, extractVideoMeta, generateThumbnail } from '../../lib/video-utils';
import { useProjectStore } from '../../hooks/useProjectStore';
import { useFrameAnalysis } from '../../hooks/useFrameAnalysis';
import VideoThumbnail from './VideoThumbnail';
import UploadProgressBar from './UploadProgressBar';
import AnalysisPanel from '../analysis/AnalysisPanel';

export default function SectionUploadZone({ sectionId }) {
  const section = TIMELINE_SECTIONS.find(s => s.id === sectionId);
  const tips = SHOOTING_TIPS[sectionId] || [];
  const uploads = useProjectStore(s => s.sections[sectionId]?.uploads || []);
  const addUpload = useProjectStore(s => s.addUpload);
  const removeUpload = useProjectStore(s => s.removeUpload);

  const [processing, setProcessing] = useState([]);
  const [errors, setErrors] = useState([]);
  const [expanded, setExpanded] = useState(false);

  const frameAnalysis = useFrameAnalysis();

  const onDrop = useCallback(async (acceptedFiles) => {
    setErrors([]);
    setExpanded(true);

    for (const file of acceptedFiles) {
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        setErrors(prev => [...prev, `${file.name}: ${validation.error}`]);
        continue;
      }

      const tempId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      setProcessing(prev => [...prev, { id: tempId, name: file.name, progress: 0 }]);

      try {
        // Extract metadata
        const meta = await extractVideoMeta(file);

        // Generate thumbnail
        let thumbnailUrl = null;
        try {
          const thumbBlob = await generateThumbnail(file);
          thumbnailUrl = URL.createObjectURL(thumbBlob);
        } catch {
          // Thumbnail optional
        }

        // Store locally (Firebase upload will come when auth is ready)
        const localUrl = URL.createObjectURL(file);

        const upload = {
          id: tempId,
          fileName: file.name,
          fileSize: file.size,
          localUrl,
          thumbnailUrl,
          duration: meta.duration,
          resolution: { width: meta.width, height: meta.height },
          uploadedAt: Date.now(),
          status: 'local',
          progress: 100,
        };

        addUpload(sectionId, upload);
        setProcessing(prev => prev.filter(p => p.id !== tempId));

        // Auto-analyze the last uploaded video
        frameAnalysis.analyze(localUrl, sectionId);
      } catch (err) {
        setErrors(prev => [...prev, `${file.name}: ${err.message}`]);
        setProcessing(prev => prev.filter(p => p.id !== tempId));
      }
    }
  }, [sectionId, addUpload, frameAnalysis]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mts'] },
    multiple: true,
  });

  const hasAnalysis = frameAnalysis.status !== 'idle';

  return (
    <div style={{
      background: theme.colors.bg.secondary,
      border: `1px solid ${theme.colors.border.primary}`,
      borderRadius: '10px', padding: '16px',
      borderLeft: `4px solid ${section?.color || theme.colors.gold.primary}`,
    }}>
      {/* Section header — clickable to expand/collapse */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: expanded ? '10px' : 0,
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{section?.icon}</span>
          <div>
            <div style={{
              fontFamily: theme.fonts.heading, fontSize: '16px',
              letterSpacing: '2px', color: section?.color || theme.colors.gold.primary,
            }}>
              {section?.label}
            </div>
            <div style={{
              fontFamily: theme.fonts.body, fontSize: '11px',
              color: theme.colors.text.muted,
            }}>
              {section?.desc} • {section?.duration}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontFamily: theme.fonts.heading, fontSize: '13px',
            color: uploads.length > 0 ? theme.colors.green.primary : theme.colors.text.dim,
            letterSpacing: '1px',
          }}>
            {uploads.length} {uploads.length === 1 ? 'VÍDEO' : 'VÍDEOS'}
          </div>
          <span style={{
            color: theme.colors.text.dim, fontSize: '12px',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}>
            ▼
          </span>
        </div>
      </div>

      {expanded && (
        <>
          {/* Shooting tips */}
          {tips.length > 0 && (
            <div style={{
              marginBottom: '10px', padding: '8px 10px',
              background: theme.colors.gold.subtle, borderRadius: '6px',
              fontFamily: theme.fonts.body, fontSize: '11px',
              color: theme.colors.text.muted, lineHeight: 1.5,
            }}>
              <strong style={{ color: section?.color }}>Dica:</strong>{' '}
              {tips[0]}
            </div>
          )}

          {/* Uploaded videos strip */}
          {uploads.length > 0 && (
            <div style={{
              display: 'flex', gap: '8px', overflowX: 'auto',
              paddingBottom: '8px', marginBottom: '10px',
            }}>
              {uploads.map(upload => (
                <VideoThumbnail
                  key={upload.id}
                  upload={upload}
                  onRemove={(id) => removeUpload(sectionId, id)}
                />
              ))}
            </div>
          )}

          {/* Frame analysis panel */}
          {hasAnalysis && (
            <AnalysisPanel
              status={frameAnalysis.status}
              progress={frameAnalysis.progress}
              frames={frameAnalysis.frames}
              analysis={frameAnalysis.analysis}
              bestFrames={frameAnalysis.bestFrames}
              error={frameAnalysis.error}
            />
          )}

          {/* Processing indicators */}
          {processing.map(p => (
            <div key={p.id} style={{ marginBottom: '6px' }}>
              <div style={{
                fontFamily: theme.fonts.body, fontSize: '11px',
                color: theme.colors.text.muted, marginBottom: '2px',
              }}>
                Processando: {p.name}
              </div>
              <UploadProgressBar progress={p.progress} status="uploading" />
            </div>
          ))}

          {/* Errors */}
          {errors.map((err, i) => (
            <div key={i} style={{
              fontFamily: theme.fonts.body, fontSize: '11px',
              color: '#8B0000', padding: '4px 8px',
              background: 'rgba(139,0,0,0.1)', borderRadius: '4px',
              marginBottom: '4px',
            }}>
              {err}
            </div>
          ))}

          {/* Drop zone */}
          <div
            {...getRootProps()}
            style={{
              border: `2px dashed ${isDragActive ? section?.color || theme.colors.gold.primary : theme.colors.border.secondary}`,
              borderRadius: '8px', padding: '20px',
              textAlign: 'center', cursor: 'pointer',
              background: isDragActive ? 'rgba(184,134,11,0.08)' : 'transparent',
              transition: 'all 0.2s',
              marginTop: '8px',
            }}
          >
            <input {...getInputProps()} />
            <div style={{
              fontFamily: theme.fonts.heading, fontSize: '14px',
              letterSpacing: '2px',
              color: isDragActive ? section?.color : theme.colors.text.dim,
              marginBottom: '4px',
            }}>
              {isDragActive ? 'SOLTE AQUI' : 'ARRASTE VÍDEOS OU CLIQUE PARA SELECIONAR'}
            </div>
            <div style={{
              fontFamily: theme.fonts.body, fontSize: '10px',
              color: theme.colors.text.dim,
            }}>
              MP4, MOV, AVI, WebM — Máximo 2GB por arquivo
            </div>
          </div>
        </>
      )}
    </div>
  );
}
