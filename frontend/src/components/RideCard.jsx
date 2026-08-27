import { Link } from 'react-router-dom';
import Badge from './Badge.jsx';

export default function RideCard({ ride }) {
  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* Origin → Destination */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
        <span>{ride.origin}</span>
        <span style={{ opacity: 0.4 }}>→</span>
        <span>{ride.destination}</span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--muted, #64748b)' }}>
        <span>📅 {ride.date}</span>
        <span>🕐 {ride.timeStart}–{ride.timeEnd}</span>
        <span>🚗 {ride.driverName}</span>
      </div>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--muted, #64748b)' }}>
          {ride.seatsAvailable ?? (ride.seatsTotal - (ride.passengerIds?.length || 0))} seat(s) free
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge status={ride.status} />
          <Link
            to={`/rides/${ride.id}`}
            style={{
              fontSize: '0.82rem',
              color: 'var(--primary, #2563eb)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
