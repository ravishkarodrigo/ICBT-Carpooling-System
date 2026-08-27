import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ridesApi, requestsApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Badge from '../components/Badge.jsx';
import { IconCalendar, IconClock, IconUser, IconRoute } from '../components/Icons.jsx';

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ride, setRide] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  useEffect(() => {
    ridesApi.detail(id)
      .then(setRide)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const onJoin = async () => {
    setReqLoading(true);
    setError(null);
    try {
      await requestsApi.create({ rideId: ride.id, message: requestMsg });
      toast.success('Join request sent to the driver');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setReqLoading(false);
    }
  };

  const onCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    try {
      await ridesApi.cancel(ride.id);
      toast.success('Ride cancelled');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;
  if (!ride) return <div className="stack"><ErrorBanner message={error || 'Ride not found'} /></div>;

  const isDriver = user?.id === ride.driverId;
  const isPassenger = ride.passengerIds?.includes(user?.id);

  return (
    <div className="stack" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="spread">
        <h1>Ride Details</h1>
        <Badge status={ride.status} />
      </div>
      
      <ErrorBanner message={error} />

      <div className="card stack">
        <div className="ride-route" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          <span className="dot from" style={{ width: 14, height: 14 }} />
          <span>{ride.origin}</span>
          <span className="connector" />
          <span className="dot to" style={{ width: 14, height: 14 }} />
          <span>{ride.destination}</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div className="muted" style={{ marginBottom: 4 }}>Date & Time</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <IconCalendar /> {ride.date}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <IconClock /> {ride.timeStart} – {ride.timeEnd}
            </div>
          </div>
          <div>
            <div className="muted" style={{ marginBottom: 4 }}>Driver</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <IconUser /> {ride.driverName}
            </div>
          </div>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 4 }}>Seats</div>
          <div>{ride.seatsAvailable} of {ride.seatsTotal} available</div>
        </div>

        {ride.notes && (
          <div>
            <div className="muted" style={{ marginBottom: 4 }}>Notes</div>
            <p>{ride.notes}</p>
          </div>
        )}
      </div>

      {isDriver && ride.status === 'open' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-danger" onClick={onCancel}>Cancel Ride</button>
        </div>
      )}

      {!isDriver && !isPassenger && ride.status === 'open' && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Request to Join</h3>
          <div className="field">
            <textarea 
              className="input" 
              placeholder="Send a message to the driver (optional)" 
              value={requestMsg} 
              onChange={e => setRequestMsg(e.target.value)} 
              rows="2"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={onJoin} disabled={reqLoading || ride.seatsAvailable === 0}>
              {reqLoading ? 'Sending...' : 'Request Seat'}
            </button>
          </div>
        </div>
      )}

      {isPassenger && (
        <div className="success-banner">
          You are a confirmed passenger for this ride.
        </div>
      )}
    </div>
  );
}
