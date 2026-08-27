import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ridesApi, requestsApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import RideCard from '../components/RideCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function MyRides() {
  const { notify } = useToast();
  const [mine, setMine] = useState(null);
  const [incoming, setIncoming] = useState([]);

  const load = () =>
    Promise.all([ridesApi.mine(), requestsApi.incoming()])
      .then(([m, inc]) => { setMine(m); setIncoming(inc); })
      .catch(() => { setMine({ driving: [], riding: [] }); setIncoming([]); });

  useEffect(() => { load(); }, []);
  if (!mine) return <Loader />;

  const pending = incoming.filter((r) => r.status === 'pending');

  const decide = async (id, decision) => {
    try {
      await requestsApi.decide(id, decision);
      notify(`Request ${decision}.`, decision === 'accepted' ? 'signal' : 'route');
      load();
    } catch (e) { notify(e.message); }
  };

  return (
    <div className="stack">
      <h1>My rides</h1>

      <section>
        <div className="section-head"><h2>Requests to review</h2></div>
        {pending.length === 0 ? (
          <EmptyState title="No pending requests" message="When someone asks to join your ride, it shows up here." />
        ) : (
          <div className="stack">
            {pending.map((r) => (
              <div key={r.id} className="card spread">
                <div>
                  <strong>New request</strong>
                  <div className="muted" style={{ fontSize: '0.88rem' }}>{r.message || 'No message'}</div>
                </div>
                <div className="row">
                  <button className="btn btn-primary btn-sm" onClick={() => decide(r.id, 'accepted')}>Accept</button>
                  <button className="btn btn-danger btn-sm" onClick={() => decide(r.id, 'rejected')}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="section-head"><h2>Rides you're driving</h2><Link to="/rides/new">Offer another</Link></div>
        {mine.driving.length === 0 ? (
          <EmptyState title="You're not driving any rides" message="Offer your empty seats and help someone commute." action={<Link to="/rides/new" className="btn btn-primary">Offer a ride</Link>} />
        ) : (
          <div className="grid grid-cards">{mine.driving.map((r) => <RideCard key={r.id} ride={r} />)}</div>
        )}
      </section>

      <section>
        <div className="section-head"><h2>Rides you're taking</h2></div>
        {mine.riding.length === 0 ? (
          <EmptyState title="No booked rides" message="Find a ride heading your way." action={<Link to="/rides" className="btn btn-ghost">Find a ride</Link>} />
        ) : (
          <div className="grid grid-cards">{mine.riding.map((r) => <RideCard key={r.id} ride={r} />)}</div>
        )}
      </section>
    </div>
  );
}
