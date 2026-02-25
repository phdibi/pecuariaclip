import { useState, useMemo, useCallback } from 'react';
import { theme } from '../../styles/theme';
import { useProjectStore } from '../../hooks/useProjectStore';
import { useAiAnalysis } from '../../hooks/useAiAnalysis';
import { useRender } from '../../hooks/useRender';
import {
  buildSimpleTimeline,
  buildTimelineFromAi,
  getTimelineDuration,
  flattenTimeline,
} from '../../lib/timeline-engine';
import { isGeminiConfigured } from '../../lib/gemini-client';
import { formatDuration } from '../../lib/video-utils';
import { OVERLAY_MAP } from '../../constants/timeline-sections';
import TimelineTrack from './TimelineTrack';
import PlaybackPreview from './PlaybackPreview';
import OverlayPreview from '../overlays/OverlayPreview';

export default function EditorTab() {
  const sections = useProjectStore(s => s.sections);
  const animalData = useProjectStore(s => s.animalData);
  const overlaySettings = useProjectStore(s => s.overlaySettings);
  const toggleBurnOverlays = useProjectStore(s => s.toggleBurnOverlays);
  const toggleSectionOverlay = useProjectStore(s => s.toggleSectionOverlay);
  const setActiveTab = useProjectStore(s => s.setActiveTab);

  const renderEngine = useRender();

  const [timeline, setTimeline] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [aiEditPlans, setAiEditPlans] = useState({});

  const aiAnalysis = useAiAnalysis();

  // Count uploads across all sections
  const totalUploads = useMemo(() =>
    Object.values(sections).reduce((sum, sec) => sum + sec.uploads.length, 0),
    [sections]
  );
  const sectionsWithUploads = useMemo(() =>
    Object.entries(sections).filter(([, sec]) => sec.uploads.length > 0).map(([id]) => id),
    [sections]
  );

  // Flat clips for playback
  const flatClips = useMemo(() =>
    timeline ? flattenTimeline(timeline) : [],
    [timeline]
  );

  const totalDuration = useMemo(() =>
    timeline ? getTimelineDuration(timeline) : 0,
    [timeline]
  );

  // Build timeline without AI (simple mode)
  const handleBuildSimple = useCallback(() => {
    const tl = buildSimpleTimeline(sections);
    setTimeline(tl);
  }, [sections]);

  // Build timeline with AI analysis
  const handleBuildWithAi = useCallback(async () => {
    if (sectionsWithUploads.length === 0) return;

    // For each section with uploads, get the best frame data URLs
    const clips = [];
    for (const sectionId of sectionsWithUploads) {
      const sectionUploads = sections[sectionId]?.uploads || [];
      // Use thumbnails as proxy frames for AI analysis
      // In full version, these would come from the frame analysis
      const bestFrameDataUrls = sectionUploads
        .filter(u => u.thumbnailUrl)
        .map(u => u.thumbnailUrl)
        .slice(0, 5);

      if (bestFrameDataUrls.length > 0) {
        clips.push({ clipIndex: 0, bestFrameDataUrls });
      }
    }

    // Run AI analysis on the first section with uploads (demo)
    // In full version, this loops through all sections
    for (const sectionId of sectionsWithUploads) {
      const sectionUploads = sections[sectionId]?.uploads || [];
      const sectionClips = sectionUploads.map((upload, idx) => ({
        clipIndex: idx,
        bestFrameDataUrls: upload.thumbnailUrl ? [upload.thumbnailUrl] : [],
      })).filter(c => c.bestFrameDataUrls.length > 0);

      if (sectionClips.length > 0) {
        try {
          const result = await aiAnalysis.analyzeSection(sectionId, sectionClips);
          if (result?.editPlan) {
            setAiEditPlans(prev => ({ ...prev, [sectionId]: result.editPlan }));
          }
        } catch {
          // If AI fails for a section, fall through to simple mode for it
        }
      }
    }

    // Build timeline from AI plans (falls back to simple for sections without AI)
    const tl = Object.keys(aiEditPlans).length > 0
      ? buildTimelineFromAi(aiEditPlans, sections)
      : buildSimpleTimeline(sections);
    setTimeline(tl);
  }, [sections, sectionsWithUploads, aiAnalysis, aiEditPlans]);

  // Trigger real render (Cloud Functions + Cloud Run Job, with local fallback)
  const handleRender = useCallback(() => {
    if (!timeline) return;
    renderEngine.render({
      timeline,
      overlaySettings,
      animalData,
      outputQuality: '1080p',
    });
  }, [timeline, overlaySettings, animalData, renderEngine]);

  // Current section for overlay preview
  const currentClip = flatClips.find(c => c.id === selectedClipId) || flatClips[0];
  const currentOverlayType = currentClip ? OVERLAY_MAP[currentClip.sectionId] : null;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${theme.colors.gold.muted} 0%, transparent 60%)`,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '10px', padding: '16px 20px',
      }}>
        <div style={{
          fontFamily: theme.fonts.heading, fontSize: '20px',
          letterSpacing: '3px', color: theme.colors.gold.primary, marginBottom: '6px',
        }}>
          EDITOR INTELIGENTE
        </div>
        <div style={{
          fontFamily: theme.fonts.body, fontSize: '12px',
          color: theme.colors.text.muted, lineHeight: 1.6,
        }}>
          A IA analisa seus vídeos, identifica os melhores momentos e sugere os cortes automaticamente.
          Revise o plano de edição, ajuste se necessário, e gere o vídeo final.
        </div>
      </div>

      {/* No uploads warning */}
      {totalUploads === 0 && (
        <div style={{
          padding: '24px', textAlign: 'center',
          background: theme.colors.bg.secondary,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: '10px',
        }}>
          <div style={{
            fontSize: '40px', marginBottom: '8px',
          }}>📹</div>
          <div style={{
            fontFamily: theme.fonts.heading, fontSize: '16px',
            letterSpacing: '2px', color: theme.colors.text.dim, marginBottom: '8px',
          }}>
            NENHUM VÍDEO IMPORTADO
          </div>
          <div style={{
            fontFamily: theme.fonts.body, fontSize: '12px',
            color: theme.colors.text.muted, marginBottom: '16px',
          }}>
            Vá para a aba "Upload Vídeos" e importe seus takes brutos antes de editar.
          </div>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              padding: '10px 24px', border: 'none', borderRadius: '6px',
              background: theme.colors.gold.primary, color: '#000',
              fontFamily: theme.fonts.heading, fontSize: '14px',
              letterSpacing: '2px', cursor: 'pointer',
            }}
          >
            IR PARA UPLOAD
          </button>
        </div>
      )}

      {/* Main editor layout (when uploads exist) */}
      {totalUploads > 0 && (
        <>
          {/* Action buttons */}
          <div style={{
            display: 'flex', gap: '10px', alignItems: 'center',
            padding: '12px 16px',
            background: theme.colors.bg.secondary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: '8px',
          }}>
            <button
              onClick={handleBuildSimple}
              style={{
                padding: '8px 18px', border: `1px solid ${theme.colors.border.secondary}`,
                borderRadius: '6px', background: 'transparent',
                color: theme.colors.text.secondary,
                fontFamily: theme.fonts.heading, fontSize: '12px',
                letterSpacing: '1.5px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              MONTAR SIMPLES
            </button>

            <button
              onClick={handleBuildWithAi}
              disabled={aiAnalysis.status === 'analyzing'}
              style={{
                padding: '8px 18px', border: 'none', borderRadius: '6px',
                background: isGeminiConfigured()
                  ? `linear-gradient(135deg, ${theme.colors.gold.primary}, #8B6914)`
                  : theme.colors.border.secondary,
                color: isGeminiConfigured() ? '#000' : theme.colors.text.dim,
                fontFamily: theme.fonts.heading, fontSize: '12px',
                letterSpacing: '1.5px', cursor: isGeminiConfigured() ? 'pointer' : 'not-allowed',
                opacity: aiAnalysis.status === 'analyzing' ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {aiAnalysis.status === 'analyzing' ? '⏳ ANALISANDO COM IA...' : '✨ MONTAR COM IA'}
            </button>

            {!isGeminiConfigured() && (
              <span style={{
                fontFamily: theme.fonts.body, fontSize: '10px',
                color: theme.colors.text.dim,
              }}>
                Configure VITE_GEMINI_API_KEY no .env.local para usar IA
              </span>
            )}

            <div style={{ flex: 1 }} />

            {/* Upload count summary */}
            <div style={{
              fontFamily: theme.fonts.body, fontSize: '11px',
              color: theme.colors.text.muted,
            }}>
              {totalUploads} vídeos em {sectionsWithUploads.length} seções
            </div>
          </div>

          {/* AI Analysis progress */}
          {aiAnalysis.status === 'analyzing' && (
            <div style={{
              padding: '12px 16px',
              background: theme.colors.gold.subtle,
              border: `1px solid ${theme.colors.gold.primary}33`,
              borderRadius: '8px',
            }}>
              <div style={{
                fontFamily: theme.fonts.body, fontSize: '12px',
                color: theme.colors.gold.primary, marginBottom: '6px',
              }}>
                {aiAnalysis.progress.step}
                {aiAnalysis.progress.total > 0 &&
                  ` (${aiAnalysis.progress.current}/${aiAnalysis.progress.total})`
                }
              </div>
              <div style={{
                height: '4px', background: theme.colors.border.subtle,
                borderRadius: '2px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: aiAnalysis.progress.total > 0
                    ? `${(aiAnalysis.progress.current / aiAnalysis.progress.total) * 100}%`
                    : '30%',
                  background: `linear-gradient(90deg, ${theme.colors.gold.dark}, ${theme.colors.gold.primary})`,
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          )}

          {/* AI error message */}
          {aiAnalysis.status === 'error' && (
            <div style={{
              padding: '10px 16px',
              background: 'rgba(139,0,0,0.1)',
              border: '1px solid rgba(139,0,0,0.3)',
              borderRadius: '8px',
              fontFamily: theme.fonts.body, fontSize: '12px', color: '#CC4444',
            }}>
              Erro na análise IA: {aiAnalysis.error}
              <br />
              <span style={{ fontSize: '11px', color: theme.colors.text.dim }}>
                Você pode usar o modo "Montar Simples" como alternativa.
              </span>
            </div>
          )}

          {/* Preview + Timeline layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Left: Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                fontFamily: theme.fonts.heading, fontSize: '14px',
                letterSpacing: '2px', color: theme.colors.text.dim,
              }}>
                PREVIEW
              </div>
              <PlaybackPreview
                flatClips={flatClips}
                overlayComponent={
                  overlaySettings.burnOverlays && currentOverlayType
                    ? <OverlayPreview data={animalData} overlayType={currentOverlayType} />
                    : null
                }
              />
            </div>

            {/* Right: Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Overlay toggle */}
              <div style={{
                background: theme.colors.bg.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '8px', padding: '12px',
              }}>
                <div style={{
                  fontFamily: theme.fonts.heading, fontSize: '14px',
                  letterSpacing: '2px', color: theme.colors.text.dim, marginBottom: '8px',
                }}>
                  OVERLAYS NO VÍDEO
                </div>

                {/* Master toggle */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', marginBottom: '8px',
                  padding: '6px 8px', borderRadius: '4px',
                  background: overlaySettings.burnOverlays
                    ? theme.colors.gold.subtle
                    : 'transparent',
                }}>
                  <input
                    type="checkbox"
                    checked={overlaySettings.burnOverlays}
                    onChange={toggleBurnOverlays}
                    style={{ accentColor: theme.colors.gold.primary }}
                  />
                  <span style={{
                    fontFamily: theme.fonts.body, fontSize: '12px',
                    color: overlaySettings.burnOverlays
                      ? theme.colors.gold.primary
                      : theme.colors.text.dim,
                    fontWeight: 600,
                  }}>
                    Queimar overlays no vídeo final
                  </span>
                </label>

                {/* Per-section toggles */}
                {overlaySettings.burnOverlays && (
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '4px', paddingLeft: '8px',
                  }}>
                    {Object.entries(overlaySettings.perSection).map(([secId, enabled]) => (
                      <label key={secId} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        cursor: 'pointer', padding: '3px 6px', borderRadius: '3px',
                      }}>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleSectionOverlay(secId)}
                          style={{ accentColor: theme.colors.gold.primary, width: '12px', height: '12px' }}
                        />
                        <span style={{
                          fontFamily: theme.fonts.body, fontSize: '10px',
                          color: enabled ? theme.colors.text.secondary : theme.colors.text.dim,
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                        }}>
                          {secId}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Video summary */}
              {timeline && (
                <div style={{
                  background: theme.colors.bg.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: '8px', padding: '12px',
                }}>
                  <div style={{
                    fontFamily: theme.fonts.heading, fontSize: '14px',
                    letterSpacing: '2px', color: theme.colors.text.dim, marginBottom: '8px',
                  }}>
                    RESUMO DO VÍDEO
                  </div>
                  {[
                    { label: 'Duração total', value: formatDuration(totalDuration) },
                    { label: 'Total de clips', value: `${flatClips.length}` },
                    { label: 'Seções preenchidas', value: `${timeline.filter(t => t.clips.length > 0).length} de 8` },
                    { label: 'Overlays', value: overlaySettings.burnOverlays ? 'Sim' : 'Não' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: i < 3 ? `1px solid ${theme.colors.border.subtle}` : 'none',
                    }}>
                      <span style={{
                        fontFamily: theme.fonts.body, fontSize: '11px',
                        color: theme.colors.text.muted,
                      }}>{item.label}</span>
                      <span style={{
                        fontFamily: theme.fonts.heading, fontSize: '13px',
                        color: theme.colors.text.primary, letterSpacing: '0.5px',
                      }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Render button */}
              {timeline && flatClips.length > 0 && (
                <>
                  <button
                    onClick={handleRender}
                    disabled={renderEngine.status === 'queued' || renderEngine.status === 'processing'}
                    style={{
                      width: '100%', padding: '14px',
                      border: 'none', borderRadius: '8px',
                      background: renderEngine.status === 'done'
                        ? '#2E7D32'
                        : `linear-gradient(135deg, ${theme.colors.gold.primary}, #8B6914)`,
                      color: renderEngine.status === 'done' ? '#fff' : '#000',
                      fontFamily: theme.fonts.heading, fontSize: '16px',
                      letterSpacing: '3px', cursor: 'pointer',
                      opacity: (renderEngine.status === 'queued' || renderEngine.status === 'processing') ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {renderEngine.status === 'queued' && '⏳ NA FILA...'}
                    {renderEngine.status === 'processing' && `⚙️ RENDERIZANDO ${renderEngine.progress}%`}
                    {renderEngine.status === 'done' && '✅ VÍDEO PRONTO — BAIXAR'}
                    {renderEngine.status === 'error' && '❌ ERRO — TENTAR NOVAMENTE'}
                    {renderEngine.status === 'idle' && '🎬 GERAR VÍDEO FINAL'}
                  </button>

                  {/* Render progress */}
                  {(renderEngine.status === 'queued' || renderEngine.status === 'processing') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{
                        height: '6px', background: theme.colors.border.subtle,
                        borderRadius: '3px', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: '3px',
                          width: `${renderEngine.progress}%`,
                          background: `linear-gradient(90deg, ${theme.colors.gold.dark}, ${theme.colors.gold.primary})`,
                          transition: 'width 0.5s',
                        }} />
                      </div>
                      {renderEngine.progressMessage && (
                        <div style={{
                          fontFamily: theme.fonts.body, fontSize: '10px',
                          color: theme.colors.text.dim, textAlign: 'center',
                        }}>
                          {renderEngine.progressMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render error */}
                  {renderEngine.status === 'error' && (
                    <div style={{
                      padding: '8px 12px', borderRadius: '6px',
                      background: 'rgba(139,0,0,0.1)', border: '1px solid rgba(139,0,0,0.3)',
                      fontFamily: theme.fonts.body, fontSize: '11px', color: '#CC4444',
                    }}>
                      {renderEngine.error}
                    </div>
                  )}

                  {/* Download link */}
                  {renderEngine.status === 'done' && renderEngine.outputUrl && (
                    <a
                      href={renderEngine.outputUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block', width: '100%', padding: '10px',
                        border: `1px solid #2E7D32`, borderRadius: '6px',
                        background: 'rgba(46,125,50,0.1)',
                        color: '#4CAF50', textAlign: 'center',
                        fontFamily: theme.fonts.heading, fontSize: '13px',
                        letterSpacing: '2px', textDecoration: 'none',
                      }}
                    >
                      BAIXAR VÍDEO FINAL (MP4)
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          {timeline && (
            <div style={{
              background: theme.colors.bg.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: '10px', padding: '14px',
            }}>
              <div style={{
                fontFamily: theme.fonts.heading, fontSize: '14px',
                letterSpacing: '2px', color: theme.colors.text.dim, marginBottom: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>TIMELINE — {formatDuration(totalDuration)} TOTAL</span>
                <span style={{
                  fontFamily: theme.fonts.body, fontSize: '10px',
                  color: theme.colors.text.dim, fontStyle: 'italic', letterSpacing: '0',
                }}>
                  Preview aproximado — vídeo final será frame-accurate
                </span>
              </div>
              {timeline.map(track => (
                <TimelineTrack
                  key={track.sectionId}
                  track={track}
                  totalTimelineDuration={totalDuration}
                  onClipSelect={(clip) => setSelectedClipId(clip.id)}
                  selectedClipId={selectedClipId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
