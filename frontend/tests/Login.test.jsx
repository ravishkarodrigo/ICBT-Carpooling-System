import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock the API + socket so the auth flow is testable in isolation.
vi.mock('../src/services/api.js', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({ user: { id: 'u1', name: 'Test' }, accessToken: 'a', refreshToken: 'r' }),
    me: vi.fn().mockRejectedValue(new Error('no session')),
  },
}));
vi.mock('../src/services/socket.js', () => ({ connectSocket: vi.fn(), disconnectSocket: vi.fn() }));

import { AuthProvider } from '../src/context/AuthContext.jsx';
import Login from '../src/pages/Login.jsx';
import { authApi } from '../src/services/api.js';

beforeEach(() => localStorage.clear());

describe('Login page', () => {
  it('submits credentials to the auth service', async () => {
    render(<MemoryRouter><AuthProvider><Login /></AuthProvider></MemoryRouter>);
    await userEvent.type(screen.getByPlaceholderText('you@icbt.lk'), 'a@icbt.lk');
    await userEvent.type(screen.getByPlaceholderText('Your password'), 'Colombo123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(authApi.login).toHaveBeenCalledWith({ email: 'a@icbt.lk', password: 'Colombo123' });
  });
});
