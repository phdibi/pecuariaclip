import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

if (getApps().length === 0) {
  initializeApp();
}

const db = getFirestore();

/**
 * Get the status of a render job.
 *
 * Client sends: { jobId: string }
 * Returns: { status, progress, progressMessage, outputUrl, error }
 */
export const getRenderStatus = onCall(
  {
    cors: true,
    enforceAppCheck: false,
    maxInstances: 20,
    timeoutSeconds: 10,
    memory: '128MiB',
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Faça login.');
    }

    const { jobId } = request.data;
    if (!jobId) {
      throw new HttpsError('invalid-argument', 'jobId é obrigatório.');
    }

    try {
      const doc = await db.collection('renderJobs').doc(jobId).get();

      if (!doc.exists) {
        throw new HttpsError('not-found', 'Job de renderização não encontrado.');
      }

      const data = doc.data();

      // Verify ownership
      if (data.userId !== request.auth.uid) {
        throw new HttpsError('permission-denied', 'Acesso negado.');
      }

      return {
        jobId: doc.id,
        status: data.status,
        progress: data.progress || 0,
        progressMessage: data.progressMessage || '',
        outputUrl: data.outputUrl || null,
        error: data.error || null,
        totalClips: data.totalClips || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null,
      };
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error('Get render status error:', err);
      throw new HttpsError('internal', `Erro ao consultar status: ${err.message}`);
    }
  }
);
