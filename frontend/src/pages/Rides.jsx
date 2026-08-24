import { useEffect, useState } from 'react';
import { ridesApi } from '../services/api.js';
import RideCard from '../components/RideCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { TextField } from '../components/Field.jsx';
import { IconSearch } from '../components/Icons.jsx';

const empty = { origin: '', destination: '', date: '', timeStart: '', timeEnd: '' };

export default function Rides() {
  const [filters, setFilters] = useState(empty);
  const [rides, setRides] = useState(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const load = () => ridesApi.list().then(setRides).catch(() => setRides([]));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const onSearch = async (e) => {
    e.preventDefault();
    setError(''); setSearching(true); setRides(null);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    try {
      const results = Object.keys(params).length ? await ridesApi.search(params) : await ridesApi.list();
      setRides(results);
    } catch (err) {
      setError(err.message); setRides([]);
    } finally {
      setSearching(false);
    }
  };

  const reset = () => { setFilters(empty); load(); };

  return (
    <div className="stack">
      <h1>Find a ride</h1>
      <p className="muted">Match by route and time window. Results are ranked by how well they fit your search.</p>

      <form className="card" onSubmit={onSearch}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
          <TextField label="From" name="origin" value={filters.origin} onChange={onChange} placeholder="e.g. Nugegoda" />
          <TextField label="To" name="destination" value={filters.destination} onChange={onChange} placeholder="e.g. ICBT Campus" />
          <TextField label="Date" name="date" type="date" value={filters.date} onChange={onChange} />
          <TextField label="From time" name="timeStart" type="time" value={filters.timeStart} onChange={onChange} />
          <TextField label="To time" name="timeEnd" type="time" value={filters.timeEnd} onChange={onChange} />
        </div>
        <div className="row">
          <button className="btn btn-primary" disabled={searching}><IconSearch width={16} /> {searching ? 'Searching…' : 'Search'}</button>
          <button type="button" className="btn btn-ghost" onClick={reset}>Clear</button>
        </div>
      </form>

      <ErrorBanner message={error} />

      {rides === null ? (
        <Loader />
      ) : rides.length === 0 ? (
        <EmptyState title="No matching rides" message="Try widening your time window or clearing filters." />
      ) : (
        <div className="grid grid-cards">
          {rides.map((r) => <RideCard key={r.id} ride={r} />)}
        </div>
      )}
    </div>
  );
}
