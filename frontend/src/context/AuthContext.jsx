import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../services/api.js';
import { connectSocket, disconnectSocket } from '../services/socket.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((data) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    connectSocket(data.accessToken);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((me) => { setUser(me); connectSocket(token); })
      .catch(() => localStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => { const d = await authApi.login(payload); persist(d); return d; };
  const register = async (payload) => { const d = await authApi.register(payload); persist(d); return d; };
  const logout = () => { localStorage.clear(); disconnectSocket(); setUser(null); };
  const updateUser = (patch) => setUser((u) => ({ ...u, ...patch }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
