import admin from 'firebase-admin';
import { config } from './env.js';

// Lazily initialise Firebase Admin so that test / in-memory mode never
// requires real credentials.
let firestore = null;

export function initFirestore() {
  if (config.useInMemoryDb) return null;
  if (firestore) return firestore;

  if (!config.firebase.projectId || !config.firebase.privateKey) {
    console.warn(
      '[firebase] Credentials not fully configured. ' +
        'Set FIREBASE_* env vars or USE_IN_MEMORY_DB=true.'
    );
    return null;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
  }
  firestore = admin.firestore();
  return firestore;
}
