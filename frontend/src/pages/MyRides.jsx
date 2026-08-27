import { useState, useEffect } from 'react';
import { ridesApi } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import RideCard from '../components/RideCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function MyRides() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ driving: [], riding: [] });

  useEffect(() => {
    ridesApi.mine()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="stack">
      <h1>My Rides</h1>

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Rides I'm Driving</h2>
        {data.driving.length === 0 ? (
          <EmptyState title="Not driving any rides" message="You haven't offered any rides yet." />
        ) : (
          <div className="grid grid-cards">
            {data.driving.map(r => <RideCard key={r.id} ride={r} />)}
          </div>
        )}
      </div>

      <hr />

      <div>
        <h2 style={{ marginBottom: '1rem' }}>Rides I'm Joining</h2>
        {data.riding.length === 0 ? (
          <EmptyState title="Not joining any rides" message="You haven't joined any rides yet." />
        ) : (
          <div className="grid grid-cards">
            {data.riding.map(r => <RideCard key={r.id} ride={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
