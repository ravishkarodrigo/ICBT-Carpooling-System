import { useEffect, useState } from 'react';
import { ridesApi, requestsApi } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RideCard from '../components/RideCard.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function MyRides() {
  const [data, setData] = useState(null);
  const [incoming, setIncoming] = useState([]);
  const [error, setError] = useState('');
  const [deciding, setDeciding] = useState('');

  const load = () => {
    ridesApi.mine().then(setData).catch(() => setError('Failed to load your rides.'));
    requestsApi.incoming().then(setIncoming).catch(() => {});
  };

  useEffect(load, []);

  const decide = async (requestId, decision) => {
    setDeciding(requestId + decision);
    try {
      await requestsApi.decide(requestId, decision);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeciding('');
    }
  };

  if (!data) return <Loader />;

  return (
    <div className="stack">
      <h1>My rides</h1>
      <ErrorBanner message={error} />

      {incoming.filter((r) => r.status === 'pending').length > 0 && (
        <section>
          <h2>Incoming requests</h2>
          {incoming.filter((r) => r.status === 'pending').map((req) => (
            <div key={req.id} className="card" style={{ marginBottom: 12 }}>
              <p><strong>{req.passengerId}</strong> wants to join ride <code>{req.rideId}</code></p>
              {req.message && <p className="muted">{req.message}</p>}
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" disabled={!!deciding} onClick={() => decide(req.id, 'accepted')}>
                  {deciding === req.id + 'accepted' ? '…' : 'Accept'}
                </button>
                <button className="btn btn-ghost btn-sm" disabled={!!deciding} onClick={() => decide(req.id, 'rejected')}>
                  {deciding === req.id + 'rejected' ? '…' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      <section>
        <h2>Rides I'm driving</h2>
        {data.driving.length === 0 ? (
          <EmptyState title="No rides offered yet" message="Head to 'Offer a ride' to get started." />
        ) : (
          <div className="grid grid-cards">{data.driving.map((r) => <RideCard key={r.id} ride={r} />)}</div>
        )}
      </section>

      <section>
        <h2>Rides I'm riding</h2>
        {data.riding.length === 0 ? (
          <EmptyState title="Not joined any rides yet" message="Find a ride and request to join." />
        ) : (
          <div className="grid grid-cards">{data.riding.map((r) => <RideCard key={r.id} ride={r} />)}</div>
        )}
      </section>
    </div>
  );
}
