import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/env.js';

// ─── App & HTTP Server ────────────────────────────────────────────────────────
const app = createApp();
const httpServer = createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin: config.clientOrigin,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[socket] client connected: ${socket.id}`);

  socket.on('join:ride', (rideId) => {
    socket.join(`ride:${rideId}`);
    console.log(`[socket] ${socket.id} joined ride:${rideId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[socket] client disconnected: ${socket.id}`);
  });
});

// Make io accessible in route handlers via req.app.get('io')
app.set('io', io);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = config.port;

httpServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[server] ❌ Port ${PORT} is already in use.`);
    console.error(`[server]    Run this to free it: kill $(lsof -ti:${PORT})`);
    console.error(`[server]    Or set a different PORT in your .env file.\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

httpServer.listen(PORT, () => {
  console.log(`[server] ✅ Running on http://localhost:${PORT} (${config.env})`);
  console.log(`[server] In-memory DB: ${config.useInMemoryDb}`);
});

export { app, httpServer };
