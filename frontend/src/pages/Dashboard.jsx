import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ridesApi, requestsApi } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RideCard from '../components/RideCard.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [rides, setRides] = useState(null);
  const [incoming, setIncoming] = useState([]);

  useEffect(() => {
    ridesApi.list().then((r) => setRides(r.slice(0, 4))).catch(() => setRides([]));
    requestsApi.incoming().catch(() => {}).then((r) => setIncoming(r || []));
  }, []);

  return (
    <div className="stack">
      <div>
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="muted">Here's what's happening on the ICBT carpool network today.</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        <div className="card stat-card">
          <div className="stat-label">Open rides</div>
          <div className="stat-value">{rides ? rides.length : '…'}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Pending requests</div>
          <div className="stat-value">{incoming.filter((r) => r.status === 'pending').length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Role</div>
          <div className="stat-value" style={{ textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
      </div>

      <div className="spread">
        <h2>Recent open rides</h2>
        <Link to="/rides" className="btn btn-ghost btn-sm">View all →</Link>
      </div>

      {rides === null ? <Loader /> : rides.length === 0 ? (
        <EmptyState title="No rides yet" message="Be the first to offer a ride!" />
      ) : (
        <div className="grid grid-cards">
          {rides.map((r) => <RideCard key={r.id} ride={r} />)}
        </div>
      )}
    </div>
  );
}
