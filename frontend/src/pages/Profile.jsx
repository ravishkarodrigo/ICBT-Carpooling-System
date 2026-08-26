import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { TextField } from '../components/Field.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', homeArea: user.homeArea || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const updated = await authApi.updateProfile(form);
      updateUser(updated);
      notify('Profile updated.', 'signal');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="stack" style={{ maxWidth: 560 }}>
      <h1>Your profile</h1>
      <div className="card">
        <div className="spread" style={{ marginBottom: 16 }}>
          <div>
            <strong style={{ fontFamily: 'var(--font-display)' }}>{user.email}</strong>
            <div className="muted" style={{ textTransform: 'capitalize' }}>{user.role}</div>
          </div>
        </div>
        <form onSubmit={onSubmit}>
          <ErrorBanner message={error} />
          <TextField label="Full name" name="name" value={form.name} onChange={onChange} />
          <TextField label="Phone (shared only with confirmed ride partners)" name="phone" value={form.phone} onChange={onChange} placeholder="Optional" />
          <TextField label="Home area" name="homeArea" value={form.homeArea} onChange={onChange} placeholder="e.g. Maharagama" />
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>
    </div>
  );
}
