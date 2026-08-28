import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

const initial = { origin: '', destination: '', date: '', timeStart: '', timeEnd: '', seatsTotal: 3, notes: '' };

export default function CreateRide() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState(initial);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setBusy(true);
    try {
      const ride = await ridesApi.create({ ...form, seatsTotal: Number(form.seatsTotal) });
      notify('Ride posted. Passengers can now request a seat.', 'signal');
      navigate(`/rides/${ride.id}`);
    } catch (err) {
      if (err.details) setFieldErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <h1>Offer a ride</h1>
      <p className="muted">Tell passengers where you're going and when. You'll approve each request yourself.</p>
      <form className="card" onSubmit={onSubmit} noValidate>
        <ErrorBanner message={error} />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <TextField label="From" name="origin" value={form.origin} onChange={onChange} error={fieldErrors.origin} placeholder="Pick-up area" required />
          <TextField label="To" name="destination" value={form.destination} onChange={onChange} error={fieldErrors.destination} placeholder="Drop-off area" required />
        </div>
        <TextField label="Date" name="date" type="date" value={form.date} onChange={onChange} error={fieldErrors.date} required />
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <TextField label="Leaves after" name="timeStart" type="time" value={form.timeStart} onChange={onChange} error={fieldErrors.timeStart} required />
          <TextField label="Arrives by" name="timeEnd" type="time" value={form.timeEnd} onChange={onChange} error={fieldErrors.timeEnd} required />
          <TextField label="Seats" name="seatsTotal" type="number" min="1" max="7" value={form.seatsTotal} onChange={onChange} error={fieldErrors.seatsTotal} required />
        </div>
        <TextField label="Notes (optional)" name="notes" as="textarea" value={form.notes} onChange={onChange} placeholder="Meeting point, luggage space, etc." />
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Posting…' : 'Post ride'}</button>
      </form>
    </div>
  );
}
