import { useState, useEffect } from 'react';
import { ridesApi } from '../services/api.js';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RideCard from '../components/RideCard.jsx';
import { Field } from '../components/Field.jsx';
import { IconSearch } from '../components/Icons.jsx';

export default function Rides() {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [search, setSearch] = useState({ origin: '', destination: '', date: '' });

  const fetchRides = async (query = {}) => {
    setLoading(true);
    try {
      const data = await ridesApi.search(query);
      setRides(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = Object.fromEntries(Object.entries(search).filter(([, v]) => !!v));
    fetchRides(q);
  };

  return (
    <div className="stack">
      <div className="spread">
        <h1>Find a ride</h1>
      </div>

      <div className="card">
        <form onSubmit={onSearch} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'flex-end' }}>
          <Field label="Origin" name="origin" value={search.origin} onChange={(e) => setSearch({ ...search, origin: e.target.value })} placeholder="e.g. Nugegoda" />
          <Field label="Destination" name="destination" value={search.destination} onChange={(e) => setSearch({ ...search, destination: e.target.value })} placeholder="e.g. ICBT" />
          <Field label="Date" name="date" type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} />
          <div style={{ marginBottom: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-block"><IconSearch /> Search</button>
          </div>
        </form>
      </div>

      {loading ? <Loader /> : rides.length === 0 ? (
        <EmptyState title="No rides found" message="Try adjusting your search criteria." />
      ) : (
        <div className="grid grid-cards">
          {rides.map(r => <RideCard key={r.id} ride={r} />)}
        </div>
      )}
    </div>
  );
}
