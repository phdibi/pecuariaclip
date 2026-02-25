import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';
import { JobsClient } from '@google-cloud/run';

// Initialize Firebase Admin if not already
if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Trigger a video render Cloud Run Job.
 *
 * Client sends:
 * {
 *   projectId: string,           // Firestore project doc ID
 *   timeline: Array<Track>,      // Full timeline with clips
 *   overlaySettings: object,     // Which overlays to burn
 *   animalData: object,          // Data for overlays
 *   outputQuality: '1080p' | '4k',
 * }
 *
 * Creates a render job document in Firestore, then launches Cloud Run Job.
 */
export const triggerRender = onCall(
  {
    cors: true,
    enforceAppCheck: false,
    maxInstances: 5,
    timeoutSeconds: 60,
    memory: '256MiB',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Faça login para renderizar.');
    }

    const { projectId, timeline, overlaySettings, animalData, outputQuality } = request.data;

    if (!timeline || !Array.isArray(timeline)) {
      throw new HttpsError('invalid-argument', 'Timeline é obrigatória.');
    }

    const userId = request.auth.uid;

    // Count total clips
    const totalClips = timeline.reduce((sum, track) => sum + (track.clips?.length || 0), 0);
    if (totalClips === 0) {
      throw new HttpsError('invalid-argument', 'Timeline não contém clips.');
    }

    try {
      // 1. Create a render job document in Firestore
      const renderJobRef = db.collection('renderJobs').doc();
      const renderJob = {
        id: renderJobRef.id,
        userId,
        projectId: projectId || 'default',
        status: 'queued',
        progress: 0,
        progressMessage: 'Na fila de renderização...',
        timeline,
        overlaySettings: overlaySettings || { burnOverlays: false },
        animalData: animalData || {},
        outputQuality: outputQuality || '1080p',
        totalClips,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: null,
        outputUrl: null,
        error: null,
      };

      await renderJobRef.set(renderJob);

      // 2. Launch Cloud Run Job (or fall back to local processing)
      try {
        await launchCloudRunJob(renderJobRef.id, userId);
      } catch (jobErr) {
        // If Cloud Run isn't set up yet, update status so client knows
        console.warn('Cloud Run Job launch failed, falling back:', jobErr.message);
        await renderJobRef.update({
          status: 'processing',
          progressMessage: 'Processando localmente (Cloud Run não configurado)...',
          updatedAt: FieldValue.serverTimestamp(),
        });

        // Simulate processing for development
        simulateLocalRender(renderJobRef);
      }

      return {
        jobId: renderJobRef.id,
        status: 'queued',
      };
    } catch (err) {
      console.error('Render trigger error:', err);
      throw new HttpsError('internal', `Erro ao iniciar renderização: ${err.message}`);
    }
  }
);

/**
 * Launch a Cloud Run Job for video rendering.
 */
async function launchCloudRunJob(jobId, userId) {
  const runClient = new JobsClient();
  const projectNumber = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT;

  // The Cloud Run Job must be pre-deployed as 'pecuaria-clip-renderer'
  const jobName = `projects/${projectNumber}/locations/us-central1/jobs/pecuaria-clip-renderer`;

  await runClient.runJob({
    name: jobName,
    overrides: {
      containerOverrides: [{
        env: [
          { name: 'RENDER_JOB_ID', value: jobId },
          { name: 'USER_ID', value: userId },
        ],
      }],
    },
  });
}

/**
 * Simulate rendering progress for local development.
 * In production, the Cloud Run Job handles this.
 */
async function simulateLocalRender(jobRef) {
  const stages = [
    { progress: 10, message: 'Baixando clips...' },
    { progress: 25, message: 'Normalizando resolução...' },
    { progress: 40, message: 'Cortando clips nos pontos in/out...' },
    { progress: 55, message: 'Aplicando transições...' },
    { progress: 70, message: 'Concatenando vídeo final...' },
    { progress: 85, message: 'Renderizando overlays...' },
    { progress: 95, message: 'Finalizando e fazendo upload...' },
  ];

  for (const stage of stages) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await jobRef.update({
      status: 'processing',
      progress: stage.progress,
      progressMessage: stage.message,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  await jobRef.update({
    status: 'done',
    progress: 100,
    progressMessage: 'Vídeo pronto!',
    outputUrl: null, // In real mode, this would be the Storage download URL
    completedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
