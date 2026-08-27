import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const rideId = searchParams.get('ride');
  const withUserId = searchParams.get('with');

  const [messages, setMessages] = useState(null);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  const load = () => {
    if (!rideId || !withUserId) { setMessages([]); return; }
    messagesApi.conversation(rideId, withUserId).then(setMessages).catch(() => setMessages([]));
  };

  useEffect(() => { load(); }, [rideId, withUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await messagesApi.send({ rideId, toUserId: withUserId, body: body.trim() });
      setBody('');
      load();
    } finally {
      setBusy(false);
    }
  };

  if (!rideId || !withUserId) {
    return (
      <div className="stack">
        <h1>Messages</h1>
        <EmptyState
          title="No conversation selected"
          message="Open a ride and tap 'Message driver' to start a conversation."
        />
      </div>
    );
  }

  if (!messages) return <Loader />;

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <h1>Messages</h1>
      <div
        className="card"
        style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 300, maxHeight: 420, overflowY: 'auto', padding: 16 }}
      >
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" message="Send the first message below." />
        ) : (
          messages.map((m) => {
            const mine = m.fromUserId === user.id;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  background: mine ? '#2563eb' : '#f1f5f9',
                  color: mine ? '#fff' : 'inherit',
                  padding: '8px 14px',
                  borderRadius: 14,
                  maxWidth: '75%',
                  fontSize: '0.9rem',
                }}
              >
                {m.body}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} style={{ display: 'flex', gap: 10 }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Type a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={busy}
        />
        <button className="btn btn-primary" disabled={busy || !body.trim()}>Send</button>
      </form>
    </div>
  );
}
