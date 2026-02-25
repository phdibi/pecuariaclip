import { theme } from '../../styles/theme';

function getScoreColor(score) {
  if (score >= 75) return theme.colors.green.primary;
  if (score >= 50) return theme.colors.gold.primary;
  if (score >= 25) return '#CC7722';
  return '#8B0000';
}

function getScoreLabel(score) {
  if (score >= 75) return 'ÓTIMO';
  if (score >= 50) return 'BOM';
  if (score >= 25) return 'MÉDIO';
  return 'RUIM';
}

export default function QualityBadge({ score, size = 'small' }) {
  const color = getScoreColor(score);
  const isSmall = size === 'small';

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      background: `${color}22`, padding: isSmall ? '1px 5px' : '2px 8px',
      borderRadius: '3px', border: `1px solid ${color}44`,
    }}>
      <span style={{
        fontFamily: theme.fonts.heading,
        fontSize: isSmall ? '11px' : '14px',
        color, letterSpacing: '0.5px',
      }}>
        {score}
      </span>
      {!isSmall && (
        <span style={{
          fontFamily: theme.fonts.body,
          fontSize: '8px', color,
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
