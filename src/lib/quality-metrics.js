/**
 * Analyze a single frame's quality from its ImageData.
 * Returns scores 0-100 for brightness, contrast, sharpness, composition,
 * plus a combined overall score.
 */
export function analyzeFrame(imageData) {
  const { data, width, height } = imageData;
  const totalPixels = width * height;

  // Convert to grayscale luminance array
  const lum = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4;
    lum[i] = 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
  }

  const brightness = calcBrightness(lum);
  const contrast = calcContrast(lum);
  const sharpness = calcSharpness(lum, width, height);
  const composition = calcComposition(lum, width, height);

  // Weighted combined score (sharpness most important)
  const overall = Math.round(
    0.2 * brightness +
    0.2 * contrast +
    0.4 * sharpness +
    0.2 * composition
  );

  return { brightness, contrast, sharpness, composition, overall };
}

/**
 * Brightness score 0-100.
 * Optimal brightness is around 120-140 luminance (not too dark, not blown out).
 */
function calcBrightness(lum) {
  let sum = 0;
  for (let i = 0; i < lum.length; i++) sum += lum[i];
  const mean = sum / lum.length;

  // Score: peak at ~130, drops off at extremes
  if (mean < 20) return Math.round((mean / 20) * 30);       // very dark: 0-30
  if (mean > 240) return Math.round(30 - ((mean - 240) / 15) * 30); // blown out
  if (mean >= 80 && mean <= 180) return 100;                 // optimal range
  if (mean < 80) return Math.round(30 + (mean - 20) / 60 * 70);
  return Math.round(100 - ((mean - 180) / 60) * 70);
}

/**
 * Contrast score 0-100.
 * Standard deviation of luminance values.
 */
function calcContrast(lum) {
  let sum = 0;
  for (let i = 0; i < lum.length; i++) sum += lum[i];
  const mean = sum / lum.length;

  let variance = 0;
  for (let i = 0; i < lum.length; i++) {
    const diff = lum[i] - mean;
    variance += diff * diff;
  }
  const stdDev = Math.sqrt(variance / lum.length);

  // StdDev 0-80 maps to score. Optimal is 30-60.
  if (stdDev < 10) return Math.round((stdDev / 10) * 20);  // flat image
  if (stdDev > 70) return Math.round(80 - ((stdDev - 70) / 30) * 30); // extreme contrast
  if (stdDev >= 30 && stdDev <= 60) return 100;
  if (stdDev < 30) return Math.round(20 + ((stdDev - 10) / 20) * 80);
  return Math.round(100 - ((stdDev - 60) / 10) * 20);
}

/**
 * Sharpness score 0-100 via Laplacian variance.
 * Higher variance = sharper image.
 */
function calcSharpness(lum, width, height) {
  // Apply 3x3 Laplacian kernel: [0,1,0; 1,-4,1; 0,1,0]
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const laplacian =
        lum[idx - width] +       // top
        lum[idx - 1] +           // left
        lum[idx + 1] +           // right
        lum[idx + width] -       // bottom
        4 * lum[idx];            // center

      sum += laplacian;
      sumSq += laplacian * laplacian;
      count++;
    }
  }

  const mean = sum / count;
  const variance = (sumSq / count) - (mean * mean);

  // Map variance to 0-100 score. Typical ranges:
  // Very blurry: < 50, Normal: 100-500, Very sharp: > 800
  if (variance < 10) return 0;
  if (variance > 800) return 100;
  return Math.min(100, Math.round((variance / 500) * 100));
}

/**
 * Composition score 0-100 based on rule-of-thirds activity distribution.
 * Checks if visual interest is spread across the frame in a balanced way.
 */
function calcComposition(lum, width, height) {
  // Divide frame into 3x3 grid
  const cellW = Math.floor(width / 3);
  const cellH = Math.floor(height / 3);
  const cellEnergy = new Float32Array(9);

  for (let gy = 0; gy < 3; gy++) {
    for (let gx = 0; gx < 3; gx++) {
      let energy = 0;
      let count = 0;
      const startY = gy * cellH;
      const startX = gx * cellW;

      for (let y = startY + 1; y < startY + cellH - 1; y++) {
        for (let x = startX + 1; x < startX + cellW - 1; x++) {
          const idx = y * width + x;
          // Edge energy (gradient magnitude)
          const dx = lum[idx + 1] - lum[idx - 1];
          const dy = lum[idx + width] - lum[idx - width];
          energy += Math.sqrt(dx * dx + dy * dy);
          count++;
        }
      }

      cellEnergy[gy * 3 + gx] = count > 0 ? energy / count : 0;
    }
  }

  // Good composition: activity in multiple regions, not just center
  const totalEnergy = cellEnergy.reduce((a, b) => a + b, 0);
  if (totalEnergy < 0.01) return 10; // nearly uniform image

  // Normalize energies
  const normalized = cellEnergy.map(e => e / totalEnergy);

  // Score higher when energy is NOT concentrated in just one cell
  const maxCell = Math.max(...normalized);
  const activeRegions = normalized.filter(n => n > 0.05).length;

  // Penalize if > 60% of energy is in one cell
  let score = 50;
  if (maxCell < 0.3) score += 30; // well distributed
  else if (maxCell < 0.5) score += 15;
  else score -= 10; // too concentrated

  // Bonus for rule-of-thirds intersections having activity
  // Intersections are at cells: 0,2,6,8 (corners) and 1,3,5,7 (edges)
  const thirdEnergy = normalized[0] + normalized[2] + normalized[6] + normalized[8];
  if (thirdEnergy > 0.3) score += 20;

  // Bonus for having multiple active regions
  score += Math.min(20, activeRegions * 3);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Analyze an array of frames and return the results.
 * Meant to be called from a Web Worker or main thread.
 */
export function analyzeFrames(frames) {
  return frames.map((frame, index) => ({
    index,
    time: frame.time,
    metrics: analyzeFrame(frame.imageData),
  }));
}

/**
 * Select the top N best frames from analysis results.
 */
export function selectBestFrames(analysisResults, topN = 8) {
  return [...analysisResults]
    .sort((a, b) => b.metrics.overall - a.metrics.overall)
    .slice(0, topN);
}
