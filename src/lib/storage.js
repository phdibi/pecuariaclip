import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage with progress tracking and abort support.
 * Returns a promise that resolves with { downloadUrl, storagePath }.
 * onProgress callback receives a number 0-100.
 *
 * @param {File} file
 * @param {string} storagePath
 * @param {function} onProgress - Callback (percentage: number)
 * @param {AbortSignal} [signal] - Optional AbortSignal for cancellation
 * @returns {Promise<{ downloadUrl: string, storagePath: string }>}
 */
export function uploadFile(file, storagePath, onProgress, signal) {
  return new Promise((resolve, reject) => {
    if (!storage) {
      reject(new Error('Firebase Storage não configurado.'));
      return;
    }

    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Support cancellation via AbortSignal
    if (signal) {
      signal.addEventListener('abort', () => {
        uploadTask.cancel();
        reject(new Error('Upload cancelado.'));
      }, { once: true });
    }

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(pct);
      },
      (error) => {
        if (error.code === 'storage/canceled') {
          reject(new Error('Upload cancelado.'));
        } else {
          reject(new Error(`Erro no upload: ${error.message}`));
        }
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({ downloadUrl, storagePath });
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage.
 */
export async function deleteFile(storagePath) {
  if (!storage) {
    throw new Error('Firebase Storage não configurado.');
  }
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
