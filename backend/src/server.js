import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { app } from './app.js';
import { config } from './config/env.js';

const httpServer = createServer(app);

export const io = new SocketIO(httpServer, {
  cors: { origin: config.clientOrigin, methods: ['GET', 'POST'], credentials: true },
});

io.on('connection', (socket) => {
  console.log('[Socket.IO] Client connected:', socket.id);
  socket.on('join:room', (roomId) => socket.join(roomId));
  socket.on('disconnect', () => console.log('[Socket.IO] Client disconnected:', socket.id));
});

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[server] ❌ Port ${config.port} is already in use.`);
    console.error(`[server]    Run: lsof -ti:${config.port} | xargs kill -9\n`);
    process.exit(1);
  }
  throw err;
});

httpServer.listen(config.port, () => {
  console.log(`[server] ✅ Running on http://localhost:${config.port}`);
});
