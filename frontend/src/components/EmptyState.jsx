export default function EmptyState({ title, message, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        gap: 12,
        textAlign: 'center',
        color: 'var(--muted, #64748b)',
        border: '1px dashed var(--border, #e2e8f0)',
        borderRadius: 12,
      }}
    >
      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" opacity="0.4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
      </svg>
      <strong style={{ fontSize: '1.05rem', color: 'var(--text, #1e293b)' }}>{title}</strong>
      {message && <p style={{ margin: 0, fontSize: '0.9rem' }}>{message}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}
