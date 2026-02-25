import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage with progress tracking.
 * Returns a promise that resolves with { downloadUrl, storagePath }.
 * onProgress callback receives a number 0-100.
 */
export function uploadFile(file, storagePath, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(pct);
      },
      (error) => {
        reject(error);
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
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
}
