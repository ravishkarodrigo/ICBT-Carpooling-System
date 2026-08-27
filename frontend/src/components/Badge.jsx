const STATUS_STYLES = {
  open: { background: '#dcfce7', color: '#15803d', label: 'Open' },
  full: { background: '#fef9c3', color: '#a16207', label: 'Full' },
  cancelled: { background: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
  completed: { background: '#e0e7ff', color: '#4338ca', label: 'Completed' },
};

export default function Badge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.open;
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 12,
        fontSize: '0.8rem',
        fontWeight: 600,
        background: style.background,
        color: style.color,
        textTransform: 'capitalize',
      }}
    >
      {style.label}
    </span>
  );
}
