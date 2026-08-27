import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconRoute } from '../components/Icons.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setBusy(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.details) {
        setFieldErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-aside">
        <div className="brand" style={{ marginBottom: 24 }}><IconRoute className="mark" /> RideShare<span style={{ color: 'var(--signal)' }}>ICBT</span></div>
        <h1>Every shared seat is one less car in the fuel queue.</h1>
        <p>Join the ICBT carpool community and turn the daily commute into a shared, cheaper, greener trip.</p>
      </aside>

      <section className="auth-form-side">
        <div className="auth-card card">
          <h2>Create your account</h2>
          <ErrorBanner message={error} />
          <form onSubmit={onSubmit} noValidate>
            <TextField label="Full name" name="name" value={form.name} onChange={onChange} error={fieldErrors.name} placeholder="Nimal Perera" required />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} error={fieldErrors.email} placeholder="you@icbt.lk" required />
            <TextField label="Password" name="password" type="password" value={form.password} onChange={onChange} error={fieldErrors.password} placeholder="At least 8 chars, 1 letter & 1 number" required />
            <TextField label="I am a" name="role" as="select" value={form.role} onChange={onChange}
              options={[{ value: 'student', label: 'Student' }, { value: 'staff', label: 'Staff' }]} />
            <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          </form>
          <hr className="route-line" />
          <p className="center muted">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
