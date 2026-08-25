import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { messagesApi, ridesApi } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

/**
 * Near-real-time chat.
 *
 * Historic messages are loaded through REST.
 * New messages arrive through Socket.IO.
 *
 * Conversation names are taken from the user's profile information
 * returned with the ride data.
 */
export default function Messages() {
  const { user } = useAuth();

  const [params] = useSearchParams();

  const rideId = params.get('ride');
  const withUser = params.get('with');

  const [threads, setThreads] = useState(null);

  const [active, setActive] = useState(
    rideId && withUser
      ? {
          rideId,
          otherUserId: withUser,
        }
      : null
  );

  const [log, setLog] = useState([]);
  const [text, setText] = useState('');

  const logRef = useRef(null);

  // ---------------------------------------------------------
  // Build conversation list
  // ---------------------------------------------------------
  useEffect(() => {
    ridesApi
      .mine()
      .then((mine) => {
        const all = [
          ...(mine.driving || []),
          ...(mine.riding || []),
        ];

        const list = all
          .map((ride) => {
            const isDriver = ride.driverId === user.id;

            /*
             * If current user is the driver:
             *   other person = first passenger
             *
             * If current user is the passenger:
             *   other person = driver
             */
            const otherUserId = isDriver
              ? ride.passengerIds?.[0] || null
              : ride.driverId;

            /*
             * Get the actual person's name.
             */
            const otherName = isDriver
              ? ride.passengerNames?.[0]?.name || 'Passenger'
              : ride.driverName || 'Driver';

            return {
              rideId: ride.id,
              label: `${ride.origin} → ${ride.destination}`,
              otherUserId,
              otherName,
            };
          })
          .filter((thread) => thread.otherUserId);

        setThreads(list);

        // Automatically select the first conversation.
        if (!active && list.length > 0) {
          setActive({
            rideId: list[0].rideId,
            otherUserId: list[0].otherUserId,
          });
        }
      })
      .catch(() => {
        setThreads([]);
      });
  }, [user.id]);

  // ---------------------------------------------------------
  // Load conversation + Socket.IO messages
  // ---------------------------------------------------------
  useEffect(() => {
    if (!active) return;

    messagesApi
      .conversation(active.rideId, active.otherUserId)
      .then(setLog)
      .catch(() => setLog([]));

    const socket = getSocket();

    if (!socket) return;

    const onMessage = (message) => {
      if (
        message.rideId === active.rideId &&
        (
          message.fromUserId === active.otherUserId ||
          message.toUserId === active.otherUserId
        )
      ) {
        setLog((previous) => [
          ...previous,
          message,
        ]);
      }
    };

    socket.on('chat:message', onMessage);

    return () => {
      socket.off('chat:message', onMessage);
    };
  }, [active?.rideId, active?.otherUserId]);

  // ---------------------------------------------------------
  // Automatically scroll to latest message
  // ---------------------------------------------------------
  useEffect(() => {
    logRef.current?.scrollTo(
      0,
      logRef.current.scrollHeight
    );
  }, [log]);

  // ---------------------------------------------------------
  // Send message
  // ---------------------------------------------------------
  const send = (event) => {
    event.preventDefault();

    if (!text.trim() || !active) return;

    const socket = getSocket();

    const payload = {
      rideId: active.rideId,
      toUserId: active.otherUserId,
      body: text.trim(),
    };

    if (socket) {
      socket.emit('chat:send', payload);
    } else {
      messagesApi
        .send(payload)
        .then((message) => {
          setLog((previous) => [
            ...previous,
            message,
          ]);
        });
    }

    setText('');
  };

  // ---------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------
  if (!threads) {
    return <Loader />;
  }

  // ---------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------
  if (threads.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        message="Once you join or accept a ride, you can message your ride partner here."
      />
    );
  }

  // ---------------------------------------------------------
  // Messages UI
  // ---------------------------------------------------------
  return (
    <div className="stack">

      <h1>Messages</h1>

      <div
        className="grid"
        style={{
          gridTemplateColumns: '240px 1fr',
          alignItems: 'start',
        }}
      >

        {/* Conversation list */}
        <div
          className="card"
          style={{
            padding: 8,
          }}
        >
          {threads.map((thread) => (
            <button
              key={
                thread.rideId +
                thread.otherUserId
              }
              className={`nav-link ${
                active?.rideId === thread.rideId
                  ? 'active'
                  : ''
              }`}
              style={{
                width: '100%',
                textAlign: 'left',
                color:
                  active?.rideId === thread.rideId
                    ? '#fff'
                    : 'var(--ink)',
              }}
              onClick={() =>
                setActive({
                  rideId: thread.rideId,
                  otherUserId:
                    thread.otherUserId,
                })
              }
            >

              {/* Person's name */}
              <div
                style={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {thread.otherName}
              </div>

              {/* Ride information */}
              <div
                style={{
                  fontSize: '0.78rem',
                  opacity: 0.75,
                  marginTop: 3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {thread.label}
              </div>

            </button>
          ))}
        </div>

        {/* Chat window */}
        <div
          className="card"
          style={{
            padding: 0,
          }}
        >
          <div className="chat">

            {/* Chat messages */}
            <div
              className="chat-log"
              ref={logRef}
            >
              {log.length === 0 ? (
                <p
                  className="muted center"
                  style={{
                    margin: 'auto',
                  }}
                >
                  Say hello to coordinate your ride.
                </p>
              ) : (
                log.map((message) => (
                  <div
                    key={message.id}
                    className={`bubble ${
                      message.fromUserId === user.id
                        ? 'me'
                        : 'them'
                    }`}
                  >
                    {message.body}
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <form
              className="chat-input"
              onSubmit={send}
            >
              <input
                className="input"
                value={text}
                onChange={(event) =>
                  setText(event.target.value)
                }
                placeholder="Type a message…"
                aria-label="Message"
              />

              <button
                className="btn btn-primary"
                type="submit"
              >
                Send
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}