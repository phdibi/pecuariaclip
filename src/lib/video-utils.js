/**
 * Extract metadata from a video file (duration, resolution).
 */
export function extractVideoMeta(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler os metadados do vídeo.'));
    };

    video.src = url;
  });
}

/**
 * Generate a thumbnail from a video file at a given time (default 1s).
 * Returns a Blob (JPEG).
 */
export function generateThumbnail(file, timeSeconds = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    const url = URL.createObjectURL(file);

    video.onloadeddata = () => {
      video.currentTime = Math.min(timeSeconds, video.duration * 0.1 || 1);
    };

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      const scale = 320 / video.videoWidth;
      canvas.width = 320;
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        },
        'image/jpeg',
        0.8
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Erro ao gerar thumbnail do vídeo.'));
    };

    video.src = url;
  });
}

/**
 * Format seconds to MM:SS display.
 */
export function formatDuration(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Format file size in bytes to human-readable string.
 */
export function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/webm',
  'video/avi',
];

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

/**
 * Validate a video file (type and size).
 */
export function validateVideoFile(file) {
  if (!ACCEPTED_VIDEO_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|wmv|webm|mts)$/i)) {
    return { valid: false, error: 'Formato não suportado. Use MP4, MOV, AVI ou WebM.' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Arquivo muito grande. Limite: 2GB por vídeo.' };
  }
  return { valid: true, error: null };
}
