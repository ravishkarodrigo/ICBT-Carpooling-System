import { useState, useEffect } from 'react';
import { notificationsApi } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Messages() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    notificationsApi.list()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="stack">
      <h1>Notifications & Messages</h1>
      {notifications.length === 0 ? (
        <EmptyState title="All caught up" message="You have no notifications." />
      ) : (
        <div className="stack">
          {notifications.map(n => (
            <div key={n.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: n.read ? 0.6 : 1 }}>
              <div>
                <p style={{ margin: 0 }}>{n.message}</p>
                <small className="muted">{new Date(n.createdAt).toLocaleString()}</small>
              </div>
              {!n.read && (
                <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark read</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
