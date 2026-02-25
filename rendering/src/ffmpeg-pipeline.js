/**
 * PecuariaClip Pro — FFmpeg Pipeline
 *
 * Builds and executes FFmpeg commands for:
 * - Trimming clips to in/out points
 * - Normalizing resolution and framerate
 * - Concatenating clips with transitions
 */

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promises as fs } from 'fs';
import { getTransitionFilter } from './transitions.js';

/**
 * Trim all clips to their in/out points.
 *
 * @param {Array} clips - Flat clip list
 * @param {Map} sourcePaths - clipId -> local source file path
 * @param {string} workDir - Working directory
 * @returns {Map<string, string>} clipId -> trimmed file path
 */
export async function buildFfmpegPipeline(clips, sourcePaths, workDir) {
  const trimmedDir = path.join(workDir, 'trimmed');
  const trimmedPaths = new Map();

  for (const clip of clips) {
    const sourcePath = sourcePaths.get(clip.id);
    if (!sourcePath) {
      console.warn(`No source path for clip ${clip.id}, skipping trim`);
      continue;
    }

    const outputPath = path.join(trimmedDir, `${clip.id}.mp4`);
    const duration = clip.outPoint - clip.inPoint;

    if (duration <= 0) {
      console.warn(`Invalid duration for clip ${clip.id}: ${duration}s`);
      continue;
    }

    try {
      await trimClip(sourcePath, outputPath, clip.inPoint, duration);
      trimmedPaths.set(clip.id, outputPath);
      console.log(`Trimmed: ${clip.id} (${clip.inPoint}s-${clip.outPoint}s = ${duration.toFixed(1)}s)`);
    } catch (err) {
      console.error(`Failed to trim clip ${clip.id}:`, err.message);
    }
  }

  return trimmedPaths;
}

/**
 * Trim a single clip using FFmpeg.
 */
function trimClip(inputPath, outputPath, startTime, duration) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .inputOptions([
        `-ss ${startTime}`,   // Seek before input (fast seeking)
      ])
      .outputOptions([
        `-t ${duration}`,     // Duration
        '-c:v libx264',       // Re-encode video (for clean cuts)
        '-preset fast',
        '-crf 18',            // High quality
        '-c:a aac',
        '-b:a 192k',
        '-movflags +faststart',
        '-y',                 // Overwrite
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

/**
 * Normalize all clips to the same resolution and framerate.
 *
 * @param {Map} trimmedPaths - clipId -> trimmed file path
 * @param {object} resolution - { width, height }
 * @param {string} workDir
 * @returns {Map<string, string>} clipId -> normalized file path
 */
export async function normalizeClips(trimmedPaths, resolution, workDir) {
  const normalizedDir = path.join(workDir, 'normalized');
  const normalizedPaths = new Map();

  const { width, height } = resolution;

  for (const [clipId, inputPath] of trimmedPaths) {
    const outputPath = path.join(normalizedDir, `${clipId}.mp4`);

    try {
      await normalizeClip(inputPath, outputPath, width, height);
      normalizedPaths.set(clipId, outputPath);
      console.log(`Normalized: ${clipId} -> ${width}x${height}`);
    } catch (err) {
      console.error(`Failed to normalize clip ${clipId}:`, err.message);
      // Fall back to trimmed version
      normalizedPaths.set(clipId, inputPath);
    }
  }

  return normalizedPaths;
}

/**
 * Normalize a single clip to target resolution and framerate.
 */
function normalizeClip(inputPath, outputPath, width, height) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-preset fast',
        '-crf 18',
        // Scale to target, padding if aspect ratio differs (pillarbox/letterbox)
        `-vf scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black,fps=30`,
        '-c:a aac',
        '-b:a 192k',
        '-ar 48000',           // Normalize audio sample rate
        '-ac 2',               // Stereo
        '-pix_fmt yuv420p',    // Compatibility
        '-movflags +faststart',
        '-y',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

/**
 * Concatenate all clips into a single video.
 * Uses FFmpeg concat filter for seamless joining, with optional transitions.
 *
 * @param {Array} clips - Ordered clip list (with transition info)
 * @param {Map} normalizedPaths - clipId -> normalized file path
 * @param {string} outputPath - Final output MP4 path
 */
export async function concatenateClips(clips, normalizedPaths, outputPath) {
  // Filter to clips that have normalized files
  const validClips = clips.filter(c => normalizedPaths.has(c.id));

  if (validClips.length === 0) {
    throw new Error('No valid clips to concatenate');
  }

  if (validClips.length === 1) {
    // Single clip — just copy it
    await fs.copyFile(normalizedPaths.get(validClips[0].id), outputPath);
    return;
  }

  // Check if any clips need transitions
  const hasTransitions = validClips.some((c, i) =>
    i < validClips.length - 1 && c.transition && c.transition !== 'cut'
  );

  if (hasTransitions) {
    // Use xfade filter for transitions between clips
    await concatenateWithTransitions(validClips, normalizedPaths, outputPath);
  } else {
    // Simple concat demuxer (fastest)
    await concatenateSimple(validClips, normalizedPaths, outputPath);
  }
}

/**
 * Simple concatenation using concat demuxer (no transitions).
 */
async function concatenateSimple(clips, normalizedPaths, outputPath) {
  const workDir = path.dirname(outputPath);
  const concatListPath = path.join(workDir, 'concat-list.txt');

  // Create concat list file
  const lines = clips.map(clip => {
    const filePath = normalizedPaths.get(clip.id);
    return `file '${filePath}'`;
  });

  await fs.writeFile(concatListPath, lines.join('\n'));

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions([
        '-f concat',
        '-safe 0',
      ])
      .outputOptions([
        '-c copy',          // Stream copy (fast, no re-encode needed)
        '-movflags +faststart',
        '-y',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

/**
 * Concatenation with transitions using xfade filter.
 * This re-encodes the video but allows cross-dissolve and other effects.
 */
async function concatenateWithTransitions(clips, normalizedPaths, outputPath) {
  const transitionDuration = 0.5; // 500ms transitions

  // For xfade, we chain filters: clip0 xfade clip1 -> result1 xfade clip2 -> result2 ...
  // This requires complex filter graph construction

  const inputFiles = clips.map(c => normalizedPaths.get(c.id));

  // Build filter complex string
  let filterParts = [];
  let currentStream = '[0:v]';
  let audioStreams = clips.map((_, i) => `[${i}:a]`);

  for (let i = 1; i < clips.length; i++) {
    const prevClip = clips[i - 1];
    const transition = prevClip.transition || 'cut';
    const xfadeType = getTransitionFilter(transition);

    const outputLabel = i < clips.length - 1 ? `[v${i}]` : '[outv]';

    // Calculate offset: when the transition starts (total duration so far minus transition overlap)
    // Each clip's duration contributes, minus overlap for each transition
    const clipDurations = clips.slice(0, i).map(c => c.duration || c.outPoint - c.inPoint);
    const prevTransitions = (i - 1) * transitionDuration;
    const offset = clipDurations.reduce((sum, d) => sum + d, 0) - prevTransitions - transitionDuration;

    if (transition === 'cut' || offset < 0) {
      // No transition, just concat
      filterParts.push(`${currentStream}[${i}:v]concat=n=2:v=1:a=0${outputLabel}`);
    } else {
      filterParts.push(
        `${currentStream}[${i}:v]xfade=transition=${xfadeType}:duration=${transitionDuration}:offset=${Math.max(0, offset).toFixed(2)}${outputLabel}`
      );
    }

    currentStream = outputLabel === '[outv]' ? '[outv]' : `[v${i}]`;
  }

  // If only 2 clips, the filter is simpler
  if (clips.length === 2) {
    const transition = clips[0].transition || 'dissolve';
    const xfadeType = getTransitionFilter(transition);
    const d0 = clips[0].duration || clips[0].outPoint - clips[0].inPoint;
    const offset = Math.max(0, d0 - transitionDuration);

    filterParts = [
      `[0:v][1:v]xfade=transition=${xfadeType}:duration=${transitionDuration}:offset=${offset.toFixed(2)}[outv]`
    ];
  }

  // Audio: simple concat (no crossfade on audio for simplicity)
  filterParts.push(`${audioStreams.join('')}concat=n=${clips.length}:v=0:a=1[outa]`);

  const filterComplex = filterParts.join('; ');

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg();

    // Add all input files
    for (const filePath of inputFiles) {
      cmd = cmd.input(filePath);
    }

    cmd
      .complexFilter(filterComplex)
      .outputOptions([
        '-map [outv]',
        '-map [outa]',
        '-c:v libx264',
        '-preset fast',
        '-crf 18',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-y',
      ])
      .output(outputPath)
      .on('end', resolve)
      .on('error', (err) => {
        console.error('Transition concat failed, falling back to simple concat');
        concatenateSimple(clips, normalizedPaths, outputPath)
          .then(resolve)
          .catch(reject);
      })
      .run();
  });
}
