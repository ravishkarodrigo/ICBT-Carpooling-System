import { Server } from 'socket.io';
import { verifyToken } from '../utils/tokens.js';
import { config } from '../config/env.js';
import { sendMessage } from '../services/messageService.js';

// Real-time chat over Socket.IO. Clients authenticate with the same JWT used
// for REST. Messages are persisted through messageService (single source of
// truth) and echoed to the recipient's room.
export function attachChat(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.clientOrigin, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('unauthorized'));
    try {
      socket.user = verifyToken(token);
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // Each user joins a private room keyed by their user id.
    socket.join(`user:${socket.user.id}`);

    socket.on('chat:send', async (payload, ack) => {
      try {
        const message = await sendMessage(socket.user.id, payload);
        // Deliver to recipient and echo back to sender for immediate UI update.
        io.to(`user:${payload.toUserId}`).emit('chat:message', message);
        socket.emit('chat:message', message);
        if (typeof ack === 'function') ack({ ok: true, message });
      } catch (err) {
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    socket.on('chat:typing', (payload) => {
      io.to(`user:${payload.toUserId}`).emit('chat:typing', {
        rideId: payload.rideId,
        fromUserId: socket.user.id,
      });
    });
  });

  return io;
}
