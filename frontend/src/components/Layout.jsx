import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { notificationsApi } from '../services/api.js';
import { getSocket } from '../services/socket.js';
import {
  IconHome, IconSearch, IconPlus, IconCar, IconChat,
  IconUser, IconHistory, IconBell, IconMenu, IconRoute,
} from './Icons.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: IconHome },
  { to: '/rides', label: 'Find a ride', icon: IconSearch },
  { to: '/rides/new', label: 'Offer a ride', icon: IconPlus },
  { to: '/my-rides', label: 'My rides', icon: IconCar },
  { to: '/messages', label: 'Messages', icon: IconChat },
  { to: '/history', label: 'Trip history', icon: IconHistory },
  { to: '/profile', label: 'Profile', icon: IconUser },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const refreshUnread = () =>
    notificationsApi.list().then((n) => setUnread(n.filter((x) => !x.read).length)).catch(() => {});

  useEffect(() => {
    refreshUnread();
    const socket = getSocket();
    if (socket) {
      const bump = () => setUnread((u) => u + 1);
      socket.on('chat:message', bump);
      return () => socket.off('chat:message', bump);
    }
  }, []);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><IconRoute className="mark" /> RideShare<span style={{ color: 'var(--signal)' }}>ICBT</span></div>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/rides'} className="nav-link" onClick={() => setOpen(false)}>
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="nav-spacer" />
        <div className="nav-user">
          <div className="name">{user?.name}</div>
          <div className="muted" style={{ color: '#8ea2b0' }}>{user?.role}</div>
          <button className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 10, color: '#cdd9e1', borderColor: 'rgba(255,255,255,0.15)' }} onClick={() => { logout(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="menu-btn" aria-label="Open menu" onClick={() => setOpen((o) => !o)}><IconMenu /></button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Share the road, save the fuel</div>
          <button className="notif-bell" aria-label="Notifications" onClick={() => navigate('/messages')}>
            <IconBell />
            {unread > 0 && <span className="notif-count">{unread}</span>}
          </button>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
