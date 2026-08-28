import { Link } from 'react-router-dom';
import Badge from './Badge.jsx';
import { IconCalendar, IconClock, IconUser } from './Icons.jsx';

// Presentational ride card. The route line (from -> to) is the signature motif.
export default function RideCard({ ride }) {
  return (
    <Link to={`/rides/${ride.id}`} className="card card-hover" style={{ display: 'block', color: 'inherit' }}>
      <div className="spread" style={{ marginBottom: 12 }}>
        <span className="badge badge-seats">{ride.seatsAvailable} seats</span>
        <Badge status={ride.status} />
      </div>

      <div className="ride-route">
        <span className="dot from" />
        <span>{ride.origin}</span>
        <span className="connector" />
        <span className="dot to" />
        <span>{ride.destination}</span>
      </div>

      <div className="ride-meta">
        <span><IconCalendar width={15} /> {ride.date}</span>
        <span><IconClock width={15} /> {ride.timeStart}–{ride.timeEnd}</span>
        <span><IconUser width={15} /> {ride.driverName}</span>
      </div>

      {ride.notes ? <p className="muted" style={{ marginTop: 10, fontSize: '0.88rem' }}>{ride.notes}</p> : null}
    </Link>
  );
}
