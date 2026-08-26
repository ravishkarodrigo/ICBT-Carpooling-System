// Small inline icon set (no external icon dependency).
const s = { width: 18, height: 18, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconRoute = (p) => (
  <svg viewBox="0 0 24 24" {...s} {...p}><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H14a3 3 0 0 0 0-6H10a3 3 0 0 1 0-6h5.5" /></svg>
);
export const IconHome = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><path d="M3 10l9-7 9 7" /><path d="M5 9v11h14V9" /></svg>);
export const IconSearch = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>);
export const IconPlus = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><path d="M12 5v14M5 12h14" /></svg>);
export const IconCar = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><path d="M3 11h18v6H3z" /><circle cx="7.5" cy="17.5" r="1.5" /><circle cx="16.5" cy="17.5" r="1.5" /></svg>);
export const IconChat = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
export const IconUser = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>);
export const IconClock = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IconCalendar = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>);
export const IconBell = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>);
export const IconMenu = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>);
export const IconHistory = (p) => (<svg viewBox="0 0 24 24" {...s} {...p}><path d="M3 3v6h6" /><path d="M3.5 9a9 9 0 1 1-1 6" /><path d="M12 7v5l3 2" /></svg>);
