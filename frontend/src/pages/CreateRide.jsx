import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

// Get today's date in YYYY-MM-DD format
function today() {
  return new Date().toISOString().split('T')[0];
}

export default function CreateRide() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState({
    origin: '',
    destination: 'ICBT Campus, Colombo 03',
    date: today(),
    timeStart: '07:00',
    timeEnd: '08:00',
    seatsTotal: 3,
    notes: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const ride = await ridesApi.create(form);
      notify('Ride created!', 'signal');
      navigate(`/rides/${ride.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <h1>Offer a ride</h1>
      <div className="card">
        <ErrorBanner message={error} />
        <form onSubmit={onSubmit} noValidate>
          <TextField label="From (your pickup area)" name="origin" value={form.origin} onChange={onChange} placeholder="e.g. Maharagama Junction" required />
          <TextField label="To (destination)" name="destination" value={form.destination} onChange={onChange} placeholder="e.g. ICBT Campus, Colombo 03" required />
          <TextField label="Date" name="date" type="date" value={form.date} onChange={onChange} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <TextField label="Departure time" name="timeStart" type="time" value={form.timeStart} onChange={onChange} required />
            <TextField label="Arrival time (est.)" name="timeEnd" type="time" value={form.timeEnd} onChange={onChange} required />
          </div>
          <TextField label="Available seats" name="seatsTotal" type="number" min={1} max={7} value={form.seatsTotal} onChange={onChange} required />
          <TextField as="textarea" label="Notes (optional)" name="notes" value={form.notes} onChange={onChange} placeholder="e.g. AC, ladies only, meeting point details…" />
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Post ride'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
