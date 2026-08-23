import dotenv from 'dotenv';
dotenv.config();

// Central, validated access to environment configuration.
// Never hardcode secrets anywhere else in the codebase.
const required = (key, fallback = undefined) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined && process.env.NODE_ENV !== 'test') {
    // Warn loudly but do not crash in dev so the app is still explorable.
    console.warn(`[config] Missing environment variable: ${key}`);
  }
  return value;
};

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwt: {
    secret: required('JWT_SECRET', 'dev-only-insecure-secret-change-me'),
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The private key is stored with escaped newlines in .env
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },
  // When true, the app uses an in-memory data store instead of Firestore.
  // This keeps tests hermetic and lets reviewers run the API without credentials.
  useInMemoryDb:
    process.env.USE_IN_MEMORY_DB === 'true' || process.env.NODE_ENV === 'test',
};
