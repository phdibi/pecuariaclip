import { theme } from '../../styles/theme';

export default function UploadProgressBar({ progress, status }) {
  const isError = status === 'error';
  const isDone = status === 'done';

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        height: '4px', background: theme.colors.border.subtle,
        borderRadius: '2px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: '2px',
          width: `${progress}%`,
          background: isError
            ? '#8B0000'
            : isDone
              ? theme.colors.green.primary
              : `linear-gradient(90deg, ${theme.colors.gold.dark}, ${theme.colors.gold.primary})`,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{
        fontFamily: theme.fonts.body, fontSize: '10px',
        color: isError ? '#8B0000' : theme.colors.text.dim,
        marginTop: '2px',
      }}>
        {isError ? 'Erro no upload' : isDone ? 'Upload completo' : `${progress}%`}
      </div>
    </div>
  );
}
