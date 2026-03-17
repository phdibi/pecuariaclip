import { theme } from '../../styles/theme';

export default function UploadProgressBar({ progress, status }) {
  const isError = status === 'error';
  const isDone = status === 'done';
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div style={{ width: '100%' }}>
      <div
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={isError ? 'Erro no upload' : isDone ? 'Upload completo' : `Upload ${clampedProgress}%`}
        style={{
          height: '4px', background: theme.colors.border.subtle,
          borderRadius: '2px', overflow: 'hidden',
        }}
      >
        <div style={{
          height: '100%', borderRadius: '2px',
          width: `${clampedProgress}%`,
          background: isError
            ? theme.colors.red
            : isDone
              ? theme.colors.green.primary
              : `linear-gradient(90deg, ${theme.colors.gold.dark}, ${theme.colors.gold.primary})`,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{
        fontFamily: theme.fonts.body, fontSize: '10px',
        color: isError ? theme.colors.red : theme.colors.text.dim,
        marginTop: '2px',
      }}>
        {isError ? 'Erro no upload' : isDone ? 'Upload completo' : `${clampedProgress}%`}
      </div>
    </div>
  );
}
