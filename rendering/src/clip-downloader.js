/**
 * PecuariaClip Pro — Clip Downloader
 *
 * Downloads source video clips from Firebase Cloud Storage
 * to the local filesystem for FFmpeg processing.
 */

import path from 'path';
import { promises as fs } from 'fs';

/**
 * Download all source clips from Cloud Storage to local temp directory.
 *
 * @param {Array} clips - Flat list of clips with storagePath or localUrl
 * @param {string} workDir - Working directory
 * @param {Storage} storage - Google Cloud Storage client
 * @param {string} userId - User ID for storage path
 * @returns {Map<string, string>} Map of clipId -> local file path
 */
export async function downloadClips(clips, workDir, storage, userId) {
  const clipsDir = path.join(workDir, 'clips');
  const downloadedPaths = new Map();

  // Deduplicate by uploadId (multiple clips can reference the same source file)
  const uniqueUploads = new Map();
  for (const clip of clips) {
    if (!uniqueUploads.has(clip.uploadId)) {
      uniqueUploads.set(clip.uploadId, clip);
    }
  }

  console.log(`Downloading ${uniqueUploads.size} unique source files...`);

  for (const [uploadId, clip] of uniqueUploads) {
    const localPath = path.join(clipsDir, `${uploadId}${getExtension(clip.uploadFileName)}`);

    try {
      if (clip.storagePath) {
        // Download from Cloud Storage
        const bucket = storage.bucket();
        const file = bucket.file(clip.storagePath);

        const [exists] = await file.exists();
        if (!exists) {
          console.warn(`File not found in storage: ${clip.storagePath}`);
          continue;
        }

        await file.download({ destination: localPath });
        console.log(`Downloaded: ${clip.storagePath} -> ${localPath}`);

      } else if (clip.storageUrl) {
        // Download from a signed URL or public URL
        const response = await fetch(clip.storageUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} downloading ${clip.storageUrl}`);
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(localPath, buffer);
        console.log(`Downloaded from URL: ${localPath}`);

      } else {
        // No remote source — this clip was uploaded locally only
        // In a full deployment, all clips would be in Cloud Storage
        console.warn(`No storage path for clip ${uploadId}, skipping download`);
        continue;
      }

      downloadedPaths.set(uploadId, localPath);

    } catch (err) {
      console.error(`Failed to download clip ${uploadId}:`, err.message);
    }
  }

  // Map clip IDs to their local file paths
  const clipPaths = new Map();
  for (const clip of clips) {
    const sourcePath = downloadedPaths.get(clip.uploadId);
    if (sourcePath) {
      clipPaths.set(clip.id, sourcePath);
    }
  }

  return clipPaths;
}

/**
 * Generate signed URLs for all clips (alternative to downloading).
 * FFmpeg can read directly from signed URLs with -ss seeking.
 */
export async function getSignedUrls(clips, storage, userId) {
  const urls = new Map();
  const bucket = storage.bucket();

  for (const clip of clips) {
    if (!clip.storagePath) continue;

    try {
      const file = bucket.file(clip.storagePath);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });

      urls.set(clip.id, signedUrl);
    } catch (err) {
      console.error(`Failed to get signed URL for ${clip.id}:`, err.message);
    }
  }

  return urls;
}

function getExtension(fileName) {
  if (!fileName) return '.mp4';
  const ext = path.extname(fileName).toLowerCase();
  return ext || '.mp4';
}
