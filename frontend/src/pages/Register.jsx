import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconRoute } from '../components/Icons.jsx';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="brand" style={{ marginBottom: 24 }}>
          <IconRoute className="mark" /> RideShare<span style={{ color: 'var(--signal)' }}>ICBT</span>
        </div>
        <h1>Join the campus carpool community.</h1>
        <p>Register as a student or staff member to start sharing rides to ICBT.</p>
      </aside>

      <section className="auth-form-side">
        <div className="auth-card card">
          <h2>Create an account</h2>
          <p className="muted" style={{ marginTop: -4 }}>It only takes a minute.</p>
          <ErrorBanner message={error} />
          <form onSubmit={onSubmit} noValidate>
            <TextField label="Full name" name="name" value={form.name} onChange={onChange} placeholder="Your full name" required />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} placeholder="you@icbt.lk" required />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={onChange} placeholder="Min 8 chars, 1 letter, 1 number" required />
            <TextField as="select" label="Role" name="role" value={form.role} onChange={onChange} options={ROLES} />
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
          </form>
          <hr className="route-line" />
          <p className="center muted">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
