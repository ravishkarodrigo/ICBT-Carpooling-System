import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { IconRoute, IconCar, IconBell, IconChat, IconLogout, IconUser, IconPlus } from './Icons.jsx';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: IconCar },
  { to: '/rides', label: 'Find a Ride', Icon: IconRoute },
  { to: '/rides/new', label: 'Offer a Ride', Icon: IconPlus },
  { to: '/my-rides', label: 'My Rides', Icon: IconCar },
  { to: '/messages', label: 'Messages', Icon: IconChat },
  { to: '/history', label: 'History', Icon: IconBell },
  { to: '/profile', label: 'Profile', Icon: IconUser },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--surface, #fff)',
          borderRight: '1px solid var(--border, #e2e8f0)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '0 20px 24px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconRoute width={22} height={22} />
          RideShare<span style={{ color: '#2563eb' }}>ICBT</span>
        </div>

        {/* Nav links */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {NAV.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#2563eb' : 'var(--text, #1e293b)',
                background: isActive ? '#eff6ff' : 'transparent',
                textDecoration: 'none',
              })}
            >
              <Icon width={18} height={18} />
              {label}
            </NavLink>
          ))}
        </div>

        {/* User + logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border, #e2e8f0)', marginTop: 16 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted, #64748b)', marginBottom: 12 }}>{user?.email}</div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--muted, #64748b)', fontSize: '0.85rem', padding: 0,
            }}
          >
            <IconLogout width={16} /> Sign out
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg, #f8fafc)' }}>
        <Outlet />
      </main>
    </div>
  );
}
