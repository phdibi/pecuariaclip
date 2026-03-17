import { useMemo } from 'react';
import { theme } from '../../styles/theme';
import { useProjectStore } from '../../hooks/useProjectStore';

/**
 * Barra de progresso do projeto.
 * Mostra o status atual: UPLOAD → ANÁLISE → EDIÇÃO → RENDERIZAÇÃO → COMPLETO
 */

const STEPS = [
  { id: 'upload', label: 'UPLOAD', icon: '📹' },
  { id: 'analysis', label: 'ANÁLISE', icon: '🔍' },
  { id: 'editing', label: 'EDIÇÃO', icon: '✂️' },
  { id: 'rendering', label: 'RENDERIZAÇÃO', icon: '⚙️' },
  { id: 'complete', label: 'COMPLETO', icon: '✅' },
];

export default function ProjectStatusBar() {
  const sections = useProjectStore(s => s.sections);
  const renderStatus = useProjectStore(s => s.renderStatus);
  const finalVideoUrl = useProjectStore(s => s.finalVideoUrl);

  const currentStep = useMemo(() => {
    const totalUploads = Object.values(sections).reduce(
      (sum, sec) => sum + sec.uploads.length, 0
    );

    if (finalVideoUrl || renderStatus === 'done') return 'complete';
    if (renderStatus === 'processing' || renderStatus === 'queued') return 'rendering';
    if (totalUploads > 0) return 'editing';
    return 'upload';
  }, [sections, renderStatus, finalVideoUrl]);

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <nav
      aria-label="Progresso do projeto"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        padding: '8px 16px',
        background: theme.colors.bg.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      {STEPS.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Step indicator */}
            <div
              aria-current={isActive ? 'step' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                borderRadius: '4px',
                background: isActive ? theme.colors.gold.subtle : 'transparent',
                transition: 'all 0.3s',
              }}
            >
              <span style={{ fontSize: '12px' }} aria-hidden="true">
                {isCompleted ? '✓' : step.icon}
              </span>
              <span style={{
                fontFamily: theme.fonts.heading,
                fontSize: '10px',
                letterSpacing: '1px',
                color: isActive
                  ? theme.colors.gold.primary
                  : isCompleted
                    ? theme.colors.text.secondary
                    : theme.colors.text.dim,
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                margin: '0 4px',
                background: isCompleted
                  ? theme.colors.gold.primary
                  : theme.colors.border.subtle,
                borderRadius: '1px',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
