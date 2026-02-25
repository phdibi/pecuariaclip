/**
 * PecuariaClip Pro — Overlay Compositor
 *
 * Composites rendered overlay PNGs onto the video using FFmpeg.
 * Each overlay is placed at the correct time range matching its section.
 *
 * Uses FFmpeg overlay filter:
 *   overlay=0:0:enable='between(t,start,end)'
 *
 * For full-screen overlays (intro, cta) the overlay replaces the video.
 * For lower-third overlays (datacard, deps, genealogy) the overlay is composited
 * with transparency on top of the footage.
 */

import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Composite overlay PNGs onto the video.
 *
 * @param {string} videoPath - Path to the concatenated video (without overlays)
 * @param {Map<string, string>} overlayPaths - sectionId -> overlay PNG path
 * @param {Array} timeline - Timeline with section timing info
 * @param {string} outputPath - Path for the final output video
 * @returns {Promise<string>} Path to the composited video
 */
export async function compositeOverlays(videoPath, overlayPaths, timeline, outputPath) {
  if (!overlayPaths || overlayPaths.size === 0) {
    // No overlays to composite — just copy the video
    await fs.copyFile(videoPath, outputPath);
    return outputPath;
  }

  // Calculate timing for each overlay
  const overlayTimings = calculateOverlayTimings(timeline, overlayPaths);

  if (overlayTimings.length === 0) {
    await fs.copyFile(videoPath, outputPath);
    return outputPath;
  }

  console.log(`Compositing ${overlayTimings.length} overlays onto video...`);

  // Build FFmpeg filter complex
  const { filterComplex, inputFiles, outputMap } = buildOverlayFilterComplex(
    videoPath,
    overlayTimings
  );

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg();

    // Add video input
    cmd = cmd.input(videoPath);

    // Add overlay image inputs
    for (const file of inputFiles) {
      cmd = cmd.input(file).inputOptions(['-loop 1']); // Loop image to make it available throughout
    }

    cmd
      .complexFilter(filterComplex)
      .outputOptions([
        `-map ${outputMap}`,
        '-map 0:a?',       // Copy audio from original video
        '-c:v libx264',
        '-preset fast',
        '-crf 18',
        '-c:a copy',
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        '-shortest',        // End when shortest input ends
        '-y',
      ])
      .output(outputPath)
      .on('end', () => {
        console.log('Overlay compositing complete');
        resolve(outputPath);
      })
      .on('error', (err) => {
        console.error('Overlay compositing failed:', err.message);
        // Fall back to video without overlays
        fs.copyFile(videoPath, outputPath)
          .then(() => resolve(outputPath))
          .catch(reject);
      })
      .run();
  });
}

/**
 * Calculate the start/end times for each overlay based on the timeline.
 */
function calculateOverlayTimings(timeline, overlayPaths) {
  const timings = [];
  let currentTime = 0;

  for (const track of timeline) {
    const trackDuration = track.clips.reduce((sum, c) => sum + (c.duration || c.outPoint - c.inPoint), 0);

    if (trackDuration > 0 && overlayPaths.has(track.sectionId)) {
      timings.push({
        sectionId: track.sectionId,
        pngPath: overlayPaths.get(track.sectionId),
        startTime: currentTime,
        endTime: currentTime + trackDuration,
        duration: trackDuration,
        // Full-screen overlays replace the video, composited ones layer on top
        isFullScreen: ['intro', 'cta'].includes(track.sectionId),
      });
    }

    currentTime += trackDuration;
  }

  return timings;
}

/**
 * Build the FFmpeg filter complex string for overlay compositing.
 *
 * For each overlay, we use:
 *   [prev][input]overlay=0:0:enable='between(t,start,end)'[next]
 *
 * This chains the overlays sequentially.
 */
function buildOverlayFilterComplex(videoPath, overlayTimings) {
  const inputFiles = [];
  const filterParts = [];

  // Deduplicate overlay files (multiple sections might use the same PNG)
  const uniqueFiles = new Map(); // pngPath -> input index
  for (const timing of overlayTimings) {
    if (!uniqueFiles.has(timing.pngPath)) {
      uniqueFiles.set(timing.pngPath, inputFiles.length + 1); // +1 because video is input 0
      inputFiles.push(timing.pngPath);
    }
  }

  let currentStream = '[0:v]';

  for (let i = 0; i < overlayTimings.length; i++) {
    const timing = overlayTimings[i];
    const inputIdx = uniqueFiles.get(timing.pngPath);
    const outputLabel = i < overlayTimings.length - 1 ? `[ov${i}]` : '[outv]';

    const start = timing.startTime.toFixed(3);
    const end = timing.endTime.toFixed(3);

    if (timing.isFullScreen) {
      // Full-screen overlay: completely replaces the video in this time range
      // Use overlay at 0,0 with enable between start and end
      filterParts.push(
        `${currentStream}[${inputIdx}:v]overlay=0:0:enable='between(t,${start},${end})'${outputLabel}`
      );
    } else {
      // Composited overlay: semi-transparent on top of the video
      // The PNG already has transparency (alpha channel), so overlay filter
      // will correctly blend it on top of the footage
      filterParts.push(
        `${currentStream}[${inputIdx}:v]overlay=0:0:enable='between(t,${start},${end})'${outputLabel}`
      );
    }

    currentStream = outputLabel;
  }

  return {
    filterComplex: filterParts.join('; '),
    inputFiles,
    outputMap: '[outv]',
  };
}
