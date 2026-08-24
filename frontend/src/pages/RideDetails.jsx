import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ridesApi, requestsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import Badge from '../components/Badge.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconCalendar, IconClock, IconUser, IconChat } from '../components/Icons.jsx';

export default function RideDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => ridesApi.detail(id).then(setRide).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]);

  if (error && !ride) return <ErrorBanner message={error} />;
  if (!ride) return <Loader />;

  const isDriver = ride.driverId === user.id;
  const isPassenger = (ride.passengerIds || []).includes(user.id);

  const requestJoin = async () => {
    setBusy(true); setError('');
    try {
      await requestsApi.create({ rideId: ride.id, message: '' });
      notify('Request sent. The driver will review it.', 'signal');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const cancel = async () => {
    setBusy(true);
    try { await ridesApi.cancel(ride.id); await load(); notify('Ride cancelled.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const complete = async () => {
    setBusy(true);
    try { await ridesApi.complete(ride.id); await load(); notify('Ride marked complete.'); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="stack" style={{ maxWidth: 720 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
      <div className="card">
        <div className="spread" style={{ marginBottom: 14 }}>
          <span className="badge badge-seats">{ride.seatsAvailable} of {ride.seatsTotal} seats free</span>
          <Badge status={ride.status} />
        </div>
        <div className="ride-route" style={{ fontSize: '1.3rem' }}>
          <span className="dot from" /><span>{ride.origin}</span>
          <span className="connector" /><span className="dot to" /><span>{ride.destination}</span>
        </div>
        <div className="ride-meta" style={{ marginTop: 16 }}>
          <span><IconCalendar width={16} /> {ride.date}</span>
          <span><IconClock width={16} /> {ride.timeStart}–{ride.timeEnd}</span>
          <span><IconUser width={16} /> Driver: {ride.driverName}</span>
        </div>
        {ride.notes ? <p style={{ marginTop: 14 }}>{ride.notes}</p> : null}
        <hr className="route-line" />
        <ErrorBanner message={error} />

        <div className="row">
          {isDriver ? (
            <>
              {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                <>
                  <button className="btn btn-primary" onClick={complete} disabled={busy}>Mark complete</button>
                  <button className="btn btn-danger" onClick={cancel} disabled={busy}>Cancel ride</button>
                </>
              )}
              <Link to="/my-rides" className="btn btn-ghost">Manage requests</Link>
            </>
          ) : isPassenger ? (
            <Link to={`/messages?ride=${ride.id}&with=${ride.driverId}`} className="btn btn-primary"><IconChat width={16} /> Message driver</Link>
          ) : ride.status === 'open' ? (
            <button className="btn btn-signal" onClick={requestJoin} disabled={busy}>{busy ? 'Sending…' : 'Request a seat'}</button>
          ) : (
            <span className="muted">This ride is not accepting new passengers.</span>
          )}
        </div>
      </div>
    </div>
  );
}
