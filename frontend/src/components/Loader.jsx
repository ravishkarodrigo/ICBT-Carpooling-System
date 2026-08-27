export default function Loader({ size = 40 }) {
  return (
    <div className="loader-wrap" aria-label="Loading" role="status">
      <svg width={size} height={size} viewBox="0 0 50 50" className="spinner">
        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--signal)" strokeWidth="4"
          strokeDasharray="90 150" strokeLinecap="round" />
      </svg>
    </div>
  );
}
