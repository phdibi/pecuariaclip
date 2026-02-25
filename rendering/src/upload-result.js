/**
 * PecuariaClip Pro — Result Uploader
 *
 * Uploads the final rendered video to Firebase Cloud Storage
 * and generates a download URL.
 */

import { createReadStream, promises as fs } from 'fs';
import path from 'path';

/**
 * Upload the rendered video to Cloud Storage.
 *
 * @param {string} filePath - Local path to the final MP4
 * @param {Storage} storage - Google Cloud Storage client
 * @param {string} userId - Firebase Auth UID
 * @param {string} projectId - Project document ID
 * @param {string} jobId - Render job ID
 * @returns {string} Public download URL
 */
export async function uploadResult(filePath, storage, userId, projectId, jobId) {
  const bucket = storage.bucket();
  const timestamp = Date.now();
  const storagePath = `projects/${userId}/${projectId}/rendered/${jobId}_${timestamp}.mp4`;

  const file = bucket.file(storagePath);

  // Get file size for logging
  const stats = await fs.stat(filePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
  console.log(`Uploading ${sizeMB}MB video to ${storagePath}...`);

  // Upload using streaming
  await new Promise((resolve, reject) => {
    const readStream = createReadStream(filePath);
    const writeStream = file.createWriteStream({
      metadata: {
        contentType: 'video/mp4',
        metadata: {
          userId,
          projectId,
          jobId,
          renderedAt: new Date().toISOString(),
        },
      },
      resumable: stats.size > 5 * 1024 * 1024, // Use resumable for files > 5MB
    });

    readStream
      .pipe(writeStream)
      .on('error', reject)
      .on('finish', resolve);
  });

  // Make the file publicly accessible (or use signed URL)
  // Option 1: Signed URL (expires in 7 days)
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  console.log(`Upload complete: ${storagePath}`);
  return signedUrl;
}

/**
 * Upload an overlay PNG to Cloud Storage.
 * Used in Phase 7 for overlay compositing.
 *
 * @param {Buffer} pngBuffer - PNG image buffer
 * @param {Storage} storage
 * @param {string} userId
 * @param {string} jobId
 * @param {string} overlayName - e.g., 'overlay_intro.png'
 * @returns {string} Local temp path of the saved PNG
 */
export async function saveOverlayLocally(pngBuffer, workDir, overlayName) {
  const overlayDir = path.join(workDir, 'overlays');
  await fs.mkdir(overlayDir, { recursive: true });

  const outputPath = path.join(overlayDir, overlayName);
  await fs.writeFile(outputPath, pngBuffer);
  return outputPath;
}
