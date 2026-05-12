import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../../../pages/SignupPage';
import * as api from '../../../services/api';
import * as auth from '../../../services/auth';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../../services/api');
vi.mock('../../../services/auth');

const renderWithRouter = (component, { route = '/signup' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={component} />
        <Route path="/" element={<div>Dashboard</div>} />
      </Routes>
    </BrowserRouter>
  );
};

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.setStoredSession = vi.fn();
  });

  it('renders signup form', () => {
    renderWithRouter(<SignupPage />);

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/)).toBeInTheDocument();
  });

  it('renders login link', () => {
    renderWithRouter(<SignupPage />);

    const loginLink = screen.getByRole('link');
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('validates all required fields', async () => {
    renderWithRouter(<SignupPage />);

    const submitButton = screen.getByRole('button', { name: /Create Account/ });
    await userEvent.click(submitButton);

    expect(screen.getByText('Username is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password.')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'invalidemail');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('validates password length', async () => {
    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'short');
    await userEvent.click(submitButton);

    expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument();
  });

  it('validates password confirmation match', async () => {
    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password456');
    await userEvent.click(submitButton);

    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('calls signup API with valid data', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'fake-jwt-token';

    api.signup.mockResolvedValue({ token: mockToken, user: mockUser });

    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('stores session on successful signup', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'fake-jwt-token';

    api.signup.mockResolvedValue({ token: mockToken, user: mockUser });

    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(auth.setStoredSession).toHaveBeenCalled();
    });
  });

  it('shows loading state during signup', async () => {
    api.signup.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('displays error message on signup failure', async () => {
    api.signup.mockRejectedValue(new Error('Username already exists'));

    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('trims whitespace from inputs', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    api.signup.mockResolvedValue({ token: 'token', user: mockUser });

    renderWithRouter(<SignupPage />);

    const usernameInput = screen.getByLabelText(/Username/);
    const emailInput = screen.getByLabelText(/^Email/);
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/);
    const submitButton = screen.getByRole('button', { name: /Create Account/ });

    await userEvent.type(usernameInput, '  testuser  ');
    await userEvent.type(emailInput, '  test@example.com  ');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.signup).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
