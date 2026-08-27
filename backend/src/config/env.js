import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  useInMemoryDb: process.env.USE_IN_MEMORY_DB !== 'false',
  jwt: {
    secret: process.env.JWT_SECRET || 'icbt-dev-secret-change-in-production',
    accessTtl: process.env.JWT_ACCESS_TTL || '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL || '7d',
  },
};
