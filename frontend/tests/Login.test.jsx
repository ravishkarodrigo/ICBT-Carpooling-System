import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from '../src/pages/Login.jsx';
import { AuthProvider } from '../src/context/AuthContext.jsx';
import { ToastProvider } from '../src/context/ToastContext.jsx';
import { authApi } from '../src/services/api.js';

// Mock the API call
vi.mock('../src/services/api.js', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn().mockResolvedValue({ id: '1', name: 'Test' }),
  },
}));

// We only want to mock the socket connection to avoid network errors in tests.
vi.mock('../src/services/socket.js', () => ({
  connectSocket: vi.fn(),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(),
}));

describe('Login page', () => {
  it('submits credentials to the auth service', async () => {
    const mockUser = { user: { id: '1', name: 'Test' }, accessToken: 'token', refreshToken: 'token' };
    authApi.login.mockResolvedValue(mockUser);

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    );

    await user.type(screen.getByLabelText(/Email address/i), 'test@icbt.lk');
    await user.type(screen.getByLabelText(/Password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@icbt.lk',
      password: 'Password123',
    });
  });
});
