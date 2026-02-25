/**
 * PecuariaClip Pro — Video Rendering Job
 *
 * Entry point for the Cloud Run Job.
 * Reads render job config from Firestore, processes clips with FFmpeg,
 * uploads the final MP4 to Cloud Storage.
 *
 * Pipeline:
 * 1. Read job config from Firestore
 * 2. Download source clips (or use signed URLs for streaming)
 * 3. Trim clips to in/out points
 * 4. Normalize resolution and framerate
 * 5. Apply transitions between clips
 * 6. Concatenate into final video
 * 7. Overlay rendering (if enabled) — Phase 7
 * 8. Upload final MP4 to Cloud Storage
 * 9. Update Firestore with download URL
 */

import { Firestore, FieldValue } from '@google-cloud/firestore';
import { Storage } from '@google-cloud/storage';
import { downloadClips } from './clip-downloader.js';
import { buildFfmpegPipeline, normalizeClips, concatenateClips } from './ffmpeg-pipeline.js';
import { renderOverlays } from './overlay-renderer.js';
import { compositeOverlays } from './overlay-compositor.js';
import { uploadResult } from './upload-result.js';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const firestore = new Firestore();
const storage = new Storage();

const RENDER_JOB_ID = process.env.RENDER_JOB_ID;
const USER_ID = process.env.USER_ID;

async function main() {
  if (!RENDER_JOB_ID) {
    console.error('RENDER_JOB_ID not set');
    process.exit(1);
  }

  const jobRef = firestore.collection('renderJobs').doc(RENDER_JOB_ID);
  const workDir = path.join(os.tmpdir(), `render-${RENDER_JOB_ID}`);

  try {
    // 1. Read job config
    await updateProgress(jobRef, 'processing', 5, 'Lendo configuração do projeto...');

    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
      throw new Error(`Render job ${RENDER_JOB_ID} not found`);
    }

    const job = jobDoc.data();
    const { timeline, overlaySettings, animalData, outputQuality } = job;

    // Create working directory
    await fs.mkdir(workDir, { recursive: true });
    await fs.mkdir(path.join(workDir, 'clips'), { recursive: true });
    await fs.mkdir(path.join(workDir, 'trimmed'), { recursive: true });
    await fs.mkdir(path.join(workDir, 'normalized'), { recursive: true });

    // 2. Build flat clip list from timeline
    const clips = [];
    for (const track of timeline) {
      if (!track.clips || track.clips.length === 0) continue;
      for (const clip of track.clips) {
        clips.push({
          ...clip,
          sectionId: track.sectionId,
          sectionColor: track.color,
        });
      }
    }

    if (clips.length === 0) {
      throw new Error('Timeline não contém clips.');
    }

    console.log(`Processing ${clips.length} clips...`);

    // 3. Download source clips
    await updateProgress(jobRef, 'processing', 10, `Baixando ${clips.length} clips...`);
    const downloadedPaths = await downloadClips(clips, workDir, storage, USER_ID);

    // 4. Trim clips to in/out points
    await updateProgress(jobRef, 'processing', 25, 'Cortando clips nos pontos de edição...');
    const trimmedPaths = await buildFfmpegPipeline(clips, downloadedPaths, workDir);

    // 5. Normalize resolution and framerate
    const resolution = outputQuality === '4k'
      ? { width: 3840, height: 2160 }
      : { width: 1920, height: 1080 };

    await updateProgress(jobRef, 'processing', 45, `Normalizando para ${resolution.width}x${resolution.height}...`);
    const normalizedPaths = await normalizeClips(trimmedPaths, resolution, workDir);

    // 6. Concatenate clips with transitions
    await updateProgress(jobRef, 'processing', 65, 'Concatenando vídeo com transições...');
    const outputPath = path.join(workDir, 'output.mp4');
    await concatenateClips(clips, normalizedPaths, outputPath);

    // 7. Render and composite overlays (if enabled)
    let finalVideoPath = outputPath;

    if (overlaySettings?.burnOverlays) {
      await updateProgress(jobRef, 'processing', 72, 'Renderizando overlays...');
      const overlayPngPaths = await renderOverlays(
        overlaySettings, animalData, timeline, resolution, workDir
      );

      if (overlayPngPaths.size > 0) {
        await updateProgress(jobRef, 'processing', 80, 'Queimando overlays no vídeo...');
        finalVideoPath = path.join(workDir, 'output_with_overlays.mp4');
        await compositeOverlays(outputPath, overlayPngPaths, timeline, finalVideoPath);
      }
    }

    // 8. Upload final video
    await updateProgress(jobRef, 'processing', 88, 'Fazendo upload do vídeo final...');
    const userId = USER_ID || job.userId;
    const downloadUrl = await uploadResult(
      finalVideoPath,
      storage,
      userId,
      job.projectId || 'default',
      RENDER_JOB_ID
    );

    // 9. Update Firestore with completion
    await updateProgress(jobRef, 'done', 100, 'Vídeo pronto!');
    await jobRef.update({
      outputUrl: downloadUrl,
      completedAt: FieldValue.serverTimestamp(),
    });

    console.log(`Render complete! Output: ${downloadUrl}`);

    // Cleanup
    await fs.rm(workDir, { recursive: true, force: true });

  } catch (err) {
    console.error('Render failed:', err);
    await jobRef.update({
      status: 'error',
      error: err.message,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Cleanup
    try {
      await fs.rm(workDir, { recursive: true, force: true });
    } catch { /* ignore */ }

    process.exit(1);
  }
}

/**
 * Update Firestore with progress information.
 */
async function updateProgress(jobRef, status, progress, message) {
  console.log(`[${progress}%] ${message}`);
  await jobRef.update({
    status,
    progress,
    progressMessage: message,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

main();
