import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ridesApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RideCard from '../components/RideCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [rides, setRides] = useState(null);

  useEffect(() => {
    ridesApi.list().then(setRides).catch(() => setRides([]));
  }, []);

  if (!rides) return <Loader />;

  return (
    <div className="stack">
      <div>
        <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="muted">Here are the latest open rides heading to campus.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/rides/new" className="btn btn-primary">Offer a ride</Link>
        <Link to="/rides" className="btn btn-ghost">Browse all rides</Link>
      </div>

      <section>
        <div className="section-head">
          <h2>Recent rides</h2>
          <Link to="/rides">See all</Link>
        </div>

        {rides.length === 0 ? (
          <EmptyState
            title="No rides available right now"
            message="Check back soon or be the first to offer one!"
            action={<Link to="/rides/new" className="btn btn-primary">Offer a ride</Link>}
          />
        ) : (
          <div className="grid grid-cards">
            {rides.slice(0, 6).map((r) => <RideCard key={r.id} ride={r} />)}
          </div>
        )}
      </section>
    </div>
  );
}
