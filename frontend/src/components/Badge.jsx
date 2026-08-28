const map = {
  open: 'badge-open',
  full: 'badge-full',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
};
export default function Badge({ status }) {
  return <span className={`badge ${map[status] || 'badge-completed'}`}>{status}</span>;
}
