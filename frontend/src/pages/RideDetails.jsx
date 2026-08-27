import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ridesApi, requestsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import Badge from '../components/Badge.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconCalendar, IconClock, IconUser } from '../components/Icons.jsx';

export default function RideDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    ridesApi.detail(id).then(setRide).catch(() => setError('Ride not found.'));
  }, [id]);

  const isDriver = ride?.driverId === user?.id;

  const action = async (fn, label) => {
    setBusy(label);
    try { setRide(await fn()); }
    catch (err) { setError(err.message); }
    finally { setBusy(''); }
  };

  const requestJoin = () => action(() => requestsApi.create({ rideId: id }).then(() => ridesApi.detail(id)), 'join');
  const cancel = () => action(() => ridesApi.cancel(id), 'cancel');
  const complete = () => action(() => ridesApi.complete(id), 'complete');

  if (!ride && !error) return <Loader />;

  return (
    <div className="stack" style={{ maxWidth: 640 }}>
      <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate(-1)}>← Back</button>
      <ErrorBanner message={error} />
      {ride && (
        <div className="card">
          <div className="spread" style={{ marginBottom: 16 }}>
            <Badge status={ride.status} />
            <span className="badge badge-seats">{ride.seatsAvailable} seats left</span>
          </div>

          <div className="ride-route" style={{ fontSize: '1.1rem', marginBottom: 20 }}>
            <span className="dot from" /><span>{ride.origin}</span>
            <span className="connector" />
            <span className="dot to" /><span>{ride.destination}</span>
          </div>

          <div className="ride-meta" style={{ marginBottom: 20 }}>
            <span><IconCalendar width={15} /> {ride.date}</span>
            <span><IconClock width={15} /> {ride.timeStart}–{ride.timeEnd}</span>
            <span><IconUser width={15} /> {ride.driverName}</span>
          </div>

          {ride.notes && <p className="muted" style={{ marginBottom: 20 }}>{ride.notes}</p>}

          {ride.passengerNames?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p className="muted" style={{ marginBottom: 8 }}>Passengers</p>
              {ride.passengerNames.map((p) => (
                <span key={p.id} className="badge" style={{ marginRight: 6 }}>{p.name}</span>
              ))}
            </div>
          )}

          <div className="row">
            {!isDriver && ride.status === 'open' && (
              <button className="btn btn-primary" disabled={!!busy} onClick={requestJoin}>
                {busy === 'join' ? 'Requesting…' : 'Request to join'}
              </button>
            )}
            {isDriver && ride.status === 'open' && (
              <>
                <button className="btn btn-ghost" disabled={!!busy} onClick={cancel}>{busy === 'cancel' ? 'Cancelling…' : 'Cancel ride'}</button>
                <button className="btn btn-primary" disabled={!!busy} onClick={complete}>{busy === 'complete' ? 'Completing…' : 'Mark complete'}</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
