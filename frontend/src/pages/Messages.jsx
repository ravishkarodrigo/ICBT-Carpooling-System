import { useEffect, useState } from 'react';
import { messagesApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { getSocket } from '../services/socket.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState('');
  // For demo, use a fixed rideId from query param or a placeholder
  const rideId = new URLSearchParams(window.location.search).get('rideId') || '';

  useEffect(() => {
    if (!rideId) { setMessages([]); return; }
    messagesApi.conversation(rideId, user.id).then(setMessages).catch(() => setMessages([]));

    const socket = getSocket();
    if (socket) {
      socket.emit('join:ride', rideId);
      const handler = (msg) => setMessages((m) => [...(m || []), msg]);
      socket.on('chat:message', handler);
      return () => socket.off('chat:message', handler);
    }
  }, [rideId, user.id]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !rideId) return;
    try {
      await messagesApi.send({ rideId, text });
      setText('');
    } catch { /* ignore */ }
  };

  if (!rideId) return (
    <div className="stack">
      <h1>Messages</h1>
      <EmptyState title="No conversation selected" message="Open a ride and tap 'Message driver' to start chatting." />
    </div>
  );

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <h1>Ride chat</h1>
      <div className="card" style={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages === null ? <Loader /> : messages.length === 0 ? (
          <EmptyState title="No messages yet" message="Start the conversation below." />
        ) : messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.senderId === user.id ? 'mine' : 'theirs'}`}>
            <p>{m.text}</p>
            <span className="muted" style={{ fontSize: '0.75rem' }}>{new Date(m.sentAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>
      <form className="row" onSubmit={send}>
        <input className="input" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
        <button className="btn btn-primary" disabled={!text.trim()}>Send</button>
      </form>
    </div>
  );
}
