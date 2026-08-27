import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from './env.js';

/**
 * Initializes and returns the Firestore instance.
 * Returns null when running in in-memory mode (tests or missing credentials)
 * so the datastore layer falls back to the in-memory implementation.
 */
export function initFirestore() {
  if (config.useInMemoryDb) return null;

  const { projectId, clientEmail, privateKey } = config.firebase;
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[firebase] Missing credentials — falling back to in-memory store.');
    return null;
  }

  // Avoid re-initializing if already bootstrapped (e.g. hot-reload).
  if (!getApps().length) {
    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  return getFirestore();
}
