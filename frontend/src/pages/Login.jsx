import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconRoute } from '../components/Icons.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="brand" style={{ marginBottom: 24 }}><IconRoute className="mark" /> RideShare<span style={{ color: 'var(--signal)' }}>ICBT</span></div>
        <h1>Share the road, split the cost.</h1>
        <p>The ICBT carpooling platform connects students and staff for smarter, greener commutes.</p>
      </aside>

      <section className="auth-form-side">
        <div className="auth-card card">
          <h2>Sign in</h2>
          <ErrorBanner message={error} />
          <form onSubmit={onSubmit} noValidate>
            <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@icbt.lk" required />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Your password" required />
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <hr className="route-line" />
          <p className="center muted">No account? <Link to="/register">Create one</Link></p>
        </div>
      </section>
    </div>
  );
}
