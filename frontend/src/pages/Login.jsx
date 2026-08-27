import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Field } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { IconRoute } from '../components/Icons.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.target));
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
          <h2>Sign in to your account</h2>
          <ErrorBanner message={error} />
          <form onSubmit={onSubmit} className="stack" aria-label="Login Form">
            <Field label="Email address" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required />
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="center muted" style={{ marginTop: '1.5rem' }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
