export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="state" role="status">
      <div className="spinner" />
      <p className="muted">{label}</p>
    </div>
  );
}
