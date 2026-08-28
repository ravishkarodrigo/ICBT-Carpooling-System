import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconRoute } from '../components/Icons.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="brand" style={{ marginBottom: 24 }}><IconRoute className="mark" /> RideShare<span style={{ color: 'var(--signal)' }}>ICBT</span></div>
        <h1>The fuel queue is long. Your commute doesn't have to be.</h1>
        <p>Match with students and staff heading your way, split the drive, and beat the odd-even quota together.</p>
        <div className="journey">
          <div className="ride-route" style={{ color: '#fff' }}>
            <span className="dot from" /><span>Home</span>
            <span className="connector" style={{ background: 'linear-gradient(90deg,#fff 55%,transparent 0)', backgroundSize: '8px 2px', opacity: 0.4 }} />
            <span className="dot to" /><span>Campus</span>
          </div>
        </div>
      </aside>

      <section className="auth-form-side">
        <div className="auth-card card">
          <h2>Welcome back</h2>
          <p className="muted" style={{ marginTop: -4 }}>Sign in to find or offer a ride.</p>
          <ErrorBanner message={error} />
          <form onSubmit={onSubmit} noValidate>
            <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@icbt.lk" required />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Your password" required />
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <hr className="route-line" />
          <p className="center muted">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </div>
  );
}
