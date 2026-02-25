import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

let authInstance = null;

/**
 * Lazy-load Firebase Auth to avoid crashing when Firebase is not configured.
 */
async function getAuthInstance() {
  if (authInstance) return authInstance;
  try {
    const { auth } = await import('../lib/firebase.js');
    authInstance = auth;
    return auth;
  } catch {
    return null;
  }
}

/**
 * Hook para gerenciar autenticação Firebase.
 * Suporta login com Google e estado persistente.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    (async () => {
      const auth = await getAuthInstance();
      if (!auth) {
        // Firebase not configured — skip auth
        setLoading(false);
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    })();

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const auth = await getAuthInstance();
      if (!auth) {
        throw new Error('Firebase não configurado. Adicione as variáveis de ambiente.');
      }
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      // Check for common errors
      if (err.code === 'auth/popup-closed-by-user') {
        return; // User cancelled — not an error
      }
      setError(err.message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const auth = await getAuthInstance();
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    // When Firebase is not configured, allow usage without auth
    isFirebaseConfigured: !!import.meta.env.VITE_FIREBASE_API_KEY,
  };
}
