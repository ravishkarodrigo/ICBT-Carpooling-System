import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Field } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconRoute } from '../components/Icons.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    const data = Object.fromEntries(new FormData(e.target));
    try {
      await register(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      if (err.details) {
        const map = {};
        err.details.forEach((d) => (map[d.field] = d.message));
        setFieldErrors(map);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-aside">
        <h1>Share the ride,<br/>split the cost.</h1>
        <p>Join the ICBT carpooling community to make your daily commute cheaper, greener, and more fun.</p>
      </div>
      <div className="auth-form-side">
        <div className="auth-card">
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem', fontWeight: 700 }}>
            <IconRoute className="mark" /> RideShare<span style={{ color: 'var(--signal)' }}>ICBT</span>
          </div>
          <h2>Create an account</h2>
          <ErrorBanner message={error} />
          <form onSubmit={onSubmit} className="stack">
            <Field label="Full Name" name="name" required error={fieldErrors.name} />
            <Field label="Email address" name="email" type="email" required error={fieldErrors.email} />
            <Field label="Password" name="password" type="password" required error={fieldErrors.password} />
            <Field label="Role" name="role" as="select" options={[{ value: 'student', label: 'Student' }, { value: 'staff', label: 'Staff' }]} />
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <div className="center muted" style={{ marginTop: '1.5rem' }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
