import { analyzeFrame } from '../lib/quality-metrics';

/**
 * Web Worker that receives frames (with imageData) and returns quality analysis.
 * Messages: { type: 'analyze', frames: [{ time, imageData: { data, width, height } }] }
 * Response: { type: 'results', results: [{ index, time, metrics }] }
 */
self.onmessage = (e) => {
  const { type, frames } = e.data;

  if (type === 'analyze') {
    try {
      const results = [];

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        // Reconstruct ImageData from transferred buffer
        const imageData = new ImageData(
          new Uint8ClampedArray(frame.imageData.data),
          frame.imageData.width,
          frame.imageData.height
        );

        const metrics = analyzeFrame(imageData);
        results.push({ index: i, time: frame.time, metrics });

        // Report progress
        self.postMessage({
          type: 'progress',
          current: i + 1,
          total: frames.length,
        });
      }

      self.postMessage({ type: 'results', results });
    } catch (err) {
      self.postMessage({ type: 'error', message: err.message });
    }
  }
};
