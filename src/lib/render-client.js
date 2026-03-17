/**
 * PecuariaClip Pro — Render Client
 *
 * Client-side module to trigger rendering and poll for status.
 * Communicates with Cloud Functions (triggerRender, getRenderStatus).
 *
 * In development mode (no Firebase Functions deployed), simulates the render flow locally.
 */

let functionsInstance = null;
let functionsImported = false;

/**
 * Get Firebase Functions instance (lazy init).
 * Uses dynamic import to avoid crashing if firebase is not configured.
 */
async function getFunctionsClient() {
  if (functionsInstance) return functionsInstance;
  if (functionsImported) return null; // Already tried and failed

  try {
    const [{ getFunctions, connectFunctionsEmulator }, { default: app }] = await Promise.all([
      import('firebase/functions'),
      import('./firebase.js'),
    ]);

    functionsInstance = getFunctions(app, 'us-central1');

    // Connect to emulator in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
      connectFunctionsEmulator(functionsInstance, 'localhost', 5001);
    }

    functionsImported = true;
    return functionsInstance;
  } catch {
    functionsImported = true;
    return null;
  }
}

/**
 * Start a video render job.
 *
 * @param {object} params
 * @param {Array} params.timeline - Full timeline array
 * @param {object} params.overlaySettings - Overlay configuration
 * @param {object} params.animalData - Animal data for overlays
 * @param {string} params.outputQuality - '1080p' or '4k'
 * @returns {Promise<{ jobId: string, status: string }>}
 */
export async function startRender({ timeline, overlaySettings, animalData, outputQuality }) {
  const functions = await getFunctionsClient();

  if (functions) {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const triggerRender = httpsCallable(functions, 'triggerRender');
      const result = await triggerRender({
        timeline,
        overlaySettings,
        animalData,
        outputQuality: outputQuality || '1080p',
      });
      return result.data;
    } catch (err) {
      console.warn('Cloud Functions not available, using local simulation:', err.message);
    }
  }

  // Local simulation fallback
  return simulateRenderStart(timeline);
}

/**
 * Poll render status.
 *
 * @param {string} jobId
 * @returns {Promise<{ status, progress, progressMessage, outputUrl, error }>}
 */
export async function pollRenderStatus(jobId) {
  const functions = await getFunctionsClient();

  if (functions) {
    try {
      const { httpsCallable } = await import('firebase/functions');
      const getRenderStatus = httpsCallable(functions, 'getRenderStatus');
      const result = await getRenderStatus({ jobId });
      return result.data;
    } catch (err) {
      console.warn('Status poll failed:', err.message);
    }
  }

  // Local simulation fallback
  return getLocalRenderStatus(jobId);
}

// ===========================
// Local Simulation (Dev Mode)
// ===========================

const localJobs = new Map();
const MAX_LOCAL_JOBS = 10;

/**
 * Cleanup old completed/errored local jobs to prevent memory leak.
 */
function cleanupLocalJobs() {
  if (localJobs.size <= MAX_LOCAL_JOBS) return;
  const entries = [...localJobs.entries()];
  // Remove oldest completed jobs first
  const completed = entries.filter(([, j]) => j.status === 'done' || j.status === 'error');
  for (const [id] of completed.slice(0, completed.length - 2)) {
    localJobs.delete(id);
  }
}

function simulateRenderStart(timeline) {
  cleanupLocalJobs();

  const jobId = `local_${Date.now()}`;
  const totalClips = timeline.reduce((sum, t) => sum + (t.clips?.length || 0), 0);

  localJobs.set(jobId, {
    status: 'queued',
    progress: 0,
    progressMessage: 'Na fila de renderização...',
    outputUrl: null,
    error: null,
    totalClips,
    startedAt: Date.now(),
  });

  // Simulate progress
  simulateProgress(jobId, totalClips);

  return { jobId, status: 'queued' };
}

async function simulateProgress(jobId, totalClips) {
  const job = localJobs.get(jobId);
  if (!job) return;

  const stages = [
    { delay: 1000, progress: 5, message: 'Preparando arquivos...', status: 'processing' },
    { delay: 2000, progress: 15, message: `Processando ${totalClips} clips...`, status: 'processing' },
    { delay: 2500, progress: 30, message: 'Cortando clips nos pontos de edição...', status: 'processing' },
    { delay: 2000, progress: 45, message: 'Normalizando resolução para 1080p...', status: 'processing' },
    { delay: 3000, progress: 60, message: 'Aplicando transições...', status: 'processing' },
    { delay: 2500, progress: 75, message: 'Concatenando vídeo final...', status: 'processing' },
    { delay: 2000, progress: 85, message: 'Renderizando overlays...', status: 'processing' },
    { delay: 2000, progress: 95, message: 'Finalizando e otimizando...', status: 'processing' },
    { delay: 1500, progress: 100, message: 'Vídeo pronto!', status: 'done' },
  ];

  for (const stage of stages) {
    await new Promise(r => setTimeout(r, stage.delay));
    const current = localJobs.get(jobId);
    if (!current) return; // Job was cleaned up
    localJobs.set(jobId, {
      ...current,
      ...stage,
    });
  }
}

function getLocalRenderStatus(jobId) {
  const job = localJobs.get(jobId);
  if (!job) {
    return {
      status: 'error',
      progress: 0,
      progressMessage: 'Job não encontrado',
      outputUrl: null,
      error: 'Job não encontrado',
    };
  }
  return {
    status: job.status,
    progress: job.progress,
    progressMessage: job.message || job.progressMessage,
    outputUrl: job.outputUrl,
    error: job.error,
  };
}
