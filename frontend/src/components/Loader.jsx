export default function Loader({ label = 'Loading…' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
        gap: 12,
        color: 'var(--muted, #64748b)',
      }}
      role="status"
      aria-label={label}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      <span>{label}</span>
    </div>
  );
}
