import { useEffect, useState } from 'react';
import { ridesApi } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RideCard from '../components/RideCard.jsx';

export default function TripHistory() {
  const [rides, setRides] = useState(null);

  useEffect(() => {
    ridesApi.history().then(setRides).catch(() => setRides([]));
  }, []);

  return (
    <div className="stack">
      <h1>Trip history</h1>
      <p className="muted">All completed and cancelled rides you were part of.</p>
      {rides === null ? <Loader /> : rides.length === 0 ? (
        <EmptyState title="No trip history yet" message="Your completed and cancelled rides will appear here." />
      ) : (
        <div className="grid grid-cards">
          {rides.map((r) => <RideCard key={r.id} ride={r} />)}
        </div>
      )}
    </div>
  );
}
