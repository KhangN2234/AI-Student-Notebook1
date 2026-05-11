import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../../pages/LoginPage';
import * as api from '../../../services/api';
import * as auth from '../../../services/auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../../services/api');
vi.mock('../../../services/auth');

const renderWithRouter = (component, { route = '/login' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={component} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.setStoredSession = vi.fn();
  });

  it('renders login form', () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email or Username/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/ })).toBeInTheDocument();
  });

  it('renders sign up link', () => {
    renderWithRouter(<LoginPage />);

    const signupLink = screen.getByRole('link', { name: /Create one/ });
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('validates required fields', async () => {
    renderWithRouter(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /Login/ });
    await userEvent.click(submitButton);

    expect(screen.getByText('Email or username is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('requires password to be non-empty', async () => {
    renderWithRouter(<LoginPage />);

    const identifierInput = screen.getByLabelText(/Email or Username/);
    await userEvent.type(identifierInput, 'testuser');

    const submitButton = screen.getByRole('button', { name: /Login/ });
    await userEvent.click(submitButton);

    expect(screen.getByText('Password is required.')).toBeInTheDocument();
  });

  it('calls login API with credentials', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'fake-jwt-token';

    api.login.mockResolvedValue({ token: mockToken, user: mockUser });

    renderWithRouter(<LoginPage />);

    const identifierInput = screen.getByLabelText(/Email or Username/);
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: /Login/ });

    await userEvent.type(identifierInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        identifier: 'testuser',
        password: 'password123',
      });
    });
  });

  it('stores session on successful login', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'fake-jwt-token';

    api.login.mockResolvedValue({ token: mockToken, user: mockUser });

    renderWithRouter(<LoginPage />);

    const identifierInput = screen.getByLabelText(/Email or Username/);
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: /Login/ });

    await userEvent.type(identifierInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(auth.setStoredSession).toHaveBeenCalledWith({
        token: mockToken,
        user: mockUser,
        rememberMe: true,
      });
    });
  });

  it('shows loading state during login', async () => {
    api.login.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<LoginPage />);

    const identifierInput = screen.getByLabelText(/Email or Username/);
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: /Login/ });

    await userEvent.type(identifierInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Signing in...');
      expect(submitButton).toBeDisabled();
    });
  });

  it('displays error message on login failure', async () => {
    api.login.mockRejectedValue(new Error('Invalid credentials'));

    renderWithRouter(<LoginPage />);

    const identifierInput = screen.getByLabelText(/Email or Username/);
    const passwordInput = screen.getByLabelText(/Password/);
    const submitButton = screen.getByRole('button', { name: /Login/ });

    await userEvent.type(identifierInput, 'testuser');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('clears field errors when user types', async () => {
    renderWithRouter(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /Login/ });
    await userEvent.click(submitButton);

    expect(screen.getByText('Email or username is required.')).toBeInTheDocument();

    const identifierInput = screen.getByLabelText(/Email or Username/);
    await userEvent.type(identifierInput, 'testuser');

    expect(screen.queryByText('Email or username is required.')).not.toBeInTheDocument();
  });

  it('has remember me checkbox', () => {
    renderWithRouter(<LoginPage />);

    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /Remember me/ });
    expect(rememberMeCheckbox).toBeInTheDocument();
  });
});
