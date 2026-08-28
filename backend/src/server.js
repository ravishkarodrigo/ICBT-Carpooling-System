import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { app } from './app.js';
import { config } from './config/env.js';

const httpServer = createServer(app);

// Socket.IO for real-time messaging
export const io = new SocketIO(httpServer, {
  cors: {
    origin: config.clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('[Socket.IO] Client connected:', socket.id);

  socket.on('join:room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.IO] Client disconnected:', socket.id);
  });
});

httpServer.listen(config.port, '0.0.0.0', () => {
  console.log(`[Server] Listening on http://localhost:${config.port}`);
});
