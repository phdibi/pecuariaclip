/**
 * Extract representative frames from a video file at regular intervals.
 * Returns an array of { time, dataUrl, imageData } objects.
 *
 * @param {string} videoUrl - Object URL or download URL of the video
 * @param {object} options
 * @param {number} options.interval - Seconds between frame samples (default 0.5)
 * @param {number} options.maxFrames - Maximum frames to extract (default 40)
 * @param {number} options.width - Analysis frame width (default 640)
 * @param {number} options.height - Analysis frame height (default 360)
 * @param {function} options.onProgress - Callback (current, total)
 */
export function extractFrames(videoUrl, options = {}) {
  const {
    interval = 0.5,
    maxFrames = 40,
    width = 640,
    height = 360,
    onProgress,
  } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.crossOrigin = 'anonymous';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const frames = [];
    let currentTime = 0.2; // skip first 0.2s (often black)

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const totalSamples = Math.min(
        maxFrames,
        Math.floor((duration - 0.2) / interval)
      );

      if (totalSamples <= 0) {
        resolve([]);
        return;
      }

      // Calculate adaptive interval if too many frames
      const actualInterval = totalSamples >= maxFrames
        ? (duration - 0.4) / maxFrames
        : interval;

      const extractNext = () => {
        if (frames.length >= totalSamples || currentTime >= duration - 0.1) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }

        video.currentTime = currentTime;
      };

      video.onseeked = () => {
        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, width, height);

        // Get data URL for display
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);

        // Get raw pixel data for quality analysis
        const imageData = ctx.getImageData(0, 0, width, height);

        frames.push({
          time: currentTime,
          dataUrl,
          imageData,
        });

        onProgress?.(frames.length, totalSamples);

        currentTime += actualInterval;
        extractNext();
      };

      video.onerror = () => {
        reject(new Error('Erro ao extrair frames do vídeo.'));
      };

      extractNext();
    };

    video.onerror = () => {
      reject(new Error('Erro ao carregar vídeo para extração de frames.'));
    };

    video.src = videoUrl;
  });
}

/**
 * Extract frames optimized per section type.
 * Different sections need different sampling densities.
 */
export function getSectionFrameOptions(sectionId) {
  const configs = {
    intro:     { interval: 0.5, maxFrames: 10 },
    hero:      { interval: 0.3, maxFrames: 25 },
    angles:    { interval: 0.5, maxFrames: 40 },
    closeup:   { interval: 0.3, maxFrames: 40 },
    data:      { interval: 1.0, maxFrames: 10 },
    genealogy: { interval: 1.0, maxFrames: 10 },
    progeny:   { interval: 0.5, maxFrames: 20 },
    cta:       { interval: 1.0, maxFrames: 8 },
  };
  return configs[sectionId] || { interval: 0.5, maxFrames: 30 };
}
