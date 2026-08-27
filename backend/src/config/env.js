import 'dotenv/config';

function required(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Environment variable ${name} is required`);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  useInMemoryDb: process.env.USE_IN_MEMORY_DB !== 'false',
  jwt: {
    secret: process.env.JWT_SECRET || 'icbt-dev-secret-change-in-production',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
};
