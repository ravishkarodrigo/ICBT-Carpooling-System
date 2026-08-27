import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

// Connect once we have a token; reuse the same instance app-wide.
export function connectSocket(token) {
  if (socket?.connected) return socket;
  socket = io(URL, { auth: { token }, autoConnect: true });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
