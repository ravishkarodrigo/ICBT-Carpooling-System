import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ridesApi, requestsApi } from '../services/api.js';
import RideCard from '../components/RideCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { IconPlus } from '../components/Icons.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([ridesApi.list(), ridesApi.mine(), requestsApi.incoming()])
      .then(([open, mine, incoming]) => setData({ open, mine, incoming }))
      .catch(() => setData({ open: [], mine: { driving: [], riding: [] }, incoming: [] }));
  }, []);

  if (!data) return <Loader />;

  const pending = data.incoming.filter((r) => r.status === 'pending').length;
  const upcoming = [...data.mine.driving, ...data.mine.riding].filter((r) => r.status === 'open' || r.status === 'full');

  return (
    <div className="stack">
      <section className="hero">
        <h1>Good to see you, {user.name.split(' ')[0]}.</h1>
        <p>Find someone heading your way, or offer your empty seats. Less fuel burned, fewer cars in the queue.</p>
        <div className="stats">
          <div className="stat"><div className="num">{data.open.length}</div><div className="label">Open rides now</div></div>
          <div className="stat"><div className="num">{upcoming.length}</div><div className="label">Your upcoming trips</div></div>
          <div className="stat"><div className="num">{pending}</div><div className="label">Requests to review</div></div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Link to="/rides/new" className="btn btn-signal"><IconPlus width={16} /> Offer a ride</Link>{' '}
          <Link to="/rides" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}>Find a ride</Link>
        </div>
      </section>

      <div className="section-head"><h2>Available rides</h2><Link to="/rides">See all</Link></div>
      {data.open.length === 0 ? (
        <EmptyState title="No open rides yet" message="Be the first to offer one." action={<Link to="/rides/new" className="btn btn-primary">Offer a ride</Link>} />
      ) : (
        <div className="grid grid-cards">
          {data.open.slice(0, 6).map((r) => <RideCard key={r.id} ride={r} />)}
        </div>
      )}
    </div>
  );
}
