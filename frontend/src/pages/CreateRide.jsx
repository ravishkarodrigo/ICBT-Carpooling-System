import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi } from '../services/api.js';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function CreateRide() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    origin: '', destination: '', date: '', timeStart: '', timeEnd: '', seatsTotal: 3, notes: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setBusy(true);
    try {
      const ride = await ridesApi.create({ ...form, seatsTotal: Number(form.seatsTotal) });
      navigate(`/rides/${ride.id}`);
    } catch (err) {
      if (err.details) setFieldErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 600 }}>
      <div>
        <h1>Offer a ride</h1>
        <p className="muted">Fill in the details and fellow ICBT commuters can request to join.</p>
      </div>
      <form className="card" onSubmit={onSubmit} noValidate>
        <ErrorBanner message={error} />
        <TextField label="From" name="origin" value={form.origin} onChange={onChange} error={fieldErrors.origin} placeholder="e.g. Nugegoda" required />
        <TextField label="To" name="destination" value={form.destination} onChange={onChange} error={fieldErrors.destination} placeholder="e.g. ICBT Campus" required />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <TextField label="Date" name="date" type="date" value={form.date} onChange={onChange} error={fieldErrors.date} required />
          <TextField label="Depart" name="timeStart" type="time" value={form.timeStart} onChange={onChange} error={fieldErrors.timeStart} required />
          <TextField label="Arrive by" name="timeEnd" type="time" value={form.timeEnd} onChange={onChange} error={fieldErrors.timeEnd} required />
        </div>
        <TextField label="Seats available" name="seatsTotal" type="number" value={form.seatsTotal} onChange={onChange} error={fieldErrors.seatsTotal} required />
        <TextField label="Notes (optional)" name="notes" value={form.notes} onChange={onChange} placeholder="e.g. Leaving from the junction" />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create ride'}</button>
      </form>
    </div>
  );
}
