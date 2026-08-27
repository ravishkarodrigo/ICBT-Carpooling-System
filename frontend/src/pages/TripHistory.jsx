import { useEffect, useState } from 'react';
import { ridesApi } from '../services/api.js';
import RideCard from '../components/RideCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function TripHistory() {
  const [rides, setRides] = useState(null);
  useEffect(() => { ridesApi.history().then(setRides).catch(() => setRides([])); }, []);
  if (!rides) return <Loader />;
  return (
    <div className="stack">
      <h1>Trip history</h1>
      <p className="muted">Completed and cancelled trips you drove or joined.</p>
      {rides.length === 0 ? (
        <EmptyState title="No past trips yet" message="Your completed and cancelled rides will appear here." />
      ) : (
        <div className="grid grid-cards">{rides.map((r) => <RideCard key={r.id} ride={r} />)}</div>
      )}
    </div>
  );
}
