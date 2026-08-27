import { useState, useEffect } from 'react';
import { ridesApi } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import RideCard from '../components/RideCard.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function TripHistory() {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    ridesApi.history()
      .then(setRides)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="stack">
      <h1>Trip History</h1>
      {rides.length === 0 ? (
        <EmptyState title="No past trips" message="Your completed and cancelled rides will appear here." />
      ) : (
        <div className="grid grid-cards">
          {rides.map(r => <RideCard key={r.id} ride={r} />)}
        </div>
      )}
    </div>
  );
}
