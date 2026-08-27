import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ridesApi, requestsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import RideCard from '../components/RideCard.jsx';
import Badge from '../components/Badge.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    Promise.all([
      ridesApi.list(),
      requestsApi.incoming(),
    ]).then(([openRides, incomingReqs]) => {
      setRides(openRides.slice(0, 3)); // top 3 upcoming
      setRequests(incomingReqs.filter(r => r.status === 'pending').slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="stack">
      <div className="spread">
        <h1>Welcome back, {user?.name.split(' ')[0]} 👋</h1>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Pending Requests</h2>
          {requests.length === 0 ? (
            <p className="muted">No pending requests to review.</p>
          ) : (
            <div className="stack">
              {requests.map(req => (
                <div key={req.id} className="card" style={{ padding: '1rem' }}>
                  <div className="spread">
                    <div>
                      <div style={{ fontWeight: 600 }}>New request</div>
                      <div className="muted" style={{ fontSize: '0.85rem' }}>For ride ID: {req.rideId.slice(-6)}</div>
                    </div>
                    <Badge status={req.status} />
                  </div>
                  {req.message && <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>"{req.message}"</p>}
                  <Link to={`/rides/${req.rideId}`} className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem' }}>View Ride</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="spread" style={{ marginBottom: '1rem' }}>
            <h2>Upcoming Open Rides</h2>
            <Link to="/rides" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {rides.length === 0 ? (
            <p className="muted">No open rides available right now.</p>
          ) : (
            <div className="stack">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
