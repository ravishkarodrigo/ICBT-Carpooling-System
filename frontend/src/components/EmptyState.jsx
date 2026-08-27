export default function EmptyState({ title = 'Nothing here yet', message = '' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">🛣️</div>
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
    </div>
  );
}
