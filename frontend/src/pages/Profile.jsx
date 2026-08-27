import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', homeArea: user?.homeArea || '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setBusy(true);
    try {
      const updated = await authApi.updateProfile(form);
      updateUser(updated);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 500 }}>
      <div>
        <h1>Profile</h1>
        <p className="muted">Update your personal details.</p>
      </div>
      <div className="card" style={{ marginBottom: 8 }}>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
      </div>
      <form className="card" onSubmit={onSubmit} noValidate>
        <ErrorBanner message={error} />
        {success && <div className="success-banner" role="status">{success}</div>}
        <TextField label="Full name" name="name" value={form.name} onChange={onChange} required />
        <TextField label="Phone number" name="phone" value={form.phone} onChange={onChange} placeholder="e.g. 077 123 4567" />
        <TextField label="Home area" name="homeArea" value={form.homeArea} onChange={onChange} placeholder="e.g. Nugegoda" />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}
