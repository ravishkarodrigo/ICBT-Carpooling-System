import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { Field } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.target));
    try {
      const updated = await authApi.updateProfile(data);
      updateUser(updated);
      toast.success('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 600 }}>
      <h1>My Profile</h1>
      <div className="card">
        <ErrorBanner message={error} />
        <form onSubmit={onSubmit} className="stack">
          <Field label="Full Name" name="name" defaultValue={user?.name} required />
          <Field label="Phone Number" name="phone" defaultValue={user?.phone || ''} />
          <Field label="Home Area" name="homeArea" defaultValue={user?.homeArea || ''} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
