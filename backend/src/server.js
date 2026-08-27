import http from 'http';
import { app } from './app.js';
import { attachChat } from './sockets/chat.js';
import { config } from './config/env.js';
import { initFirestore } from './config/firebase.js';

initFirestore();

const server = http.createServer(app);
attachChat(server);

server.listen(config.port, () => {
  const mode = config.useInMemoryDb ? 'in-memory' : 'Firestore';
  console.log(`Carpool API listening on :${config.port} (data store: ${mode})`);
});
