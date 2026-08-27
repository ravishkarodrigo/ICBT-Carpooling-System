import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ridesApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Field } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconPlus } from '../components/Icons.jsx';

export default function CreateRide() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.target);
    const payload = {
      origin: formData.get('origin'),
      destination: formData.get('destination'),
      date: formData.get('date'),
      timeStart: formData.get('timeStart'),
      timeEnd: formData.get('timeEnd'),
      seatsTotal: parseInt(formData.get('seatsTotal'), 10),
      notes: formData.get('notes')
    };

    try {
      const ride = await ridesApi.create(payload);
      toast.success('Ride published successfully!');
      navigate(`/rides/${ride.id}`);
    } catch (err) {
      setError(err.message);
      if (err.details) {
        const map = {};
        err.details.forEach((d) => (map[d.field] = d.message));
        setFieldErrors(map);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1>Offer a ride</h1>
      <div className="card">
        <ErrorBanner message={error} />
        <form onSubmit={onSubmit} className="stack">
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Origin" name="origin" required error={fieldErrors.origin} placeholder="Starting point" />
            <Field label="Destination" name="destination" required error={fieldErrors.destination} placeholder="Where are you going?" />
          </div>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Field label="Date" name="date" type="date" required error={fieldErrors.date} />
            <Field label="Time Start" name="timeStart" type="time" required error={fieldErrors.timeStart} />
            <Field label="Time End" name="timeEnd" type="time" required error={fieldErrors.timeEnd} />
          </div>
          <Field label="Available Seats" name="seatsTotal" type="number" required error={fieldErrors.seatsTotal} />
          <div className="field">
            <label className="field-label">Notes (optional)</label>
            <textarea name="notes" className="input" rows="3" placeholder="Any specific requirements or pickup details..." />
            {fieldErrors.notes && <p className="field-error">{fieldErrors.notes}</p>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <IconPlus /> {loading ? 'Publishing...' : 'Publish Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
