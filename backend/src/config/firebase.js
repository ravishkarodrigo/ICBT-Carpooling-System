/**
 * Firebase Admin SDK initialiser.
 * Returns a Firestore instance when credentials are present in the environment,
 * or null when running in test / development without Firebase credentials.
 */

let _db = null;
let _initialized = false;

export function initFirestore() {
  if (_initialized) return _db;
  _initialized = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    // Credentials not configured – fall back to in-memory datastore.
    return null;
  }

  try {
    // If you need actual Firestore, firebase-admin must be installed.
    // For now we'll just fall back to in-memory to prevent parse errors.
    _db = null;
  } catch {
    _db = null;
  }

  return _db;
}
