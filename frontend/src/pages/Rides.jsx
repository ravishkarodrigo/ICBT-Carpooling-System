import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ridesApi } from '../services/api.js';
import RideCard from '../components/RideCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Rides() {
  const [rides, setRides] = useState(null);
  const [search, setSearch] = useState({ origin: '', destination: '', date: '' });
  const [filtered, setFiltered] = useState(null);

  useEffect(() => {
    ridesApi.list().then((r) => { setRides(r); setFiltered(r); }).catch(() => { setRides([]); setFiltered([]); });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const params = Object.fromEntries(Object.entries(search).filter(([, v]) => v));
    if (!Object.keys(params).length) {
      setFiltered(rides);
      return;
    }
    try {
      const results = await ridesApi.search(params);
      setFiltered(results);
    } catch {
      setFiltered([]);
    }
  };

  if (!rides) return <Loader />;

  return (
    <div className="stack">
      <div className="section-head">
        <h1>Find a ride</h1>
        <Link to="/rides/new" className="btn btn-primary">Offer a ride</Link>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>From</label>
          <input className="input" placeholder="e.g. Maharagama" value={search.origin} onChange={(e) => setSearch({ ...search, origin: e.target.value })} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>To</label>
          <input className="input" placeholder="e.g. Colombo 03" value={search.destination} onChange={(e) => setSearch({ ...search, destination: e.target.value })} />
        </div>
        <div style={{ minWidth: 140 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: 4 }}>Date</label>
          <input className="input" type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} />
        </div>
        <button className="btn btn-primary" type="submit">Search</button>
        {(search.origin || search.destination || search.date) && (
          <button type="button" className="btn btn-ghost" onClick={() => { setSearch({ origin: '', destination: '', date: '' }); setFiltered(rides); }}>Clear</button>
        )}
      </form>

      {/* Results */}
      {!filtered || filtered.length === 0 ? (
        <EmptyState title="No rides found" message="Try adjusting your search or offer a ride yourself." />
      ) : (
        <div className="grid grid-cards">
          {filtered.map((r) => <RideCard key={r.id} ride={r} />)}
        </div>
      )}
    </div>
  );
}
