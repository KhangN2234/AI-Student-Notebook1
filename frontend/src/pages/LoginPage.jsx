import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { setStoredSession } from '../services/auth';

function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const redirectPath = location.state?.from?.pathname || '/';

	const [identifier, setIdentifier] = useState('');
	const [password, setPassword] = useState('');
	const [rememberMe, setRememberMe] = useState(true);
	const [fieldErrors, setFieldErrors] = useState({ identifier: '', password: '' });
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	function validate() {
		const nextErrors = { identifier: '', password: '' };

		if (!identifier.trim()) {
			nextErrors.identifier = 'Email or username is required.';
		}

		if (!password) {
			nextErrors.password = 'Password is required.';
		}

		setFieldErrors(nextErrors);
		return !nextErrors.identifier && !nextErrors.password;
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!validate()) {
			return;
		}

		try {
			setLoading(true);
			setError('');
			const data = await login({ identifier: identifier.trim(), password });
			setStoredSession({ token: data.token, user: data.user, rememberMe });
			navigate(redirectPath, { replace: true });
		} catch (err) {
			setError(err.message || 'Unable to sign in.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="note-page auth-page">
			<header className="note-page-header">
				<h2>Login</h2>
				<p className="lead">Sign in to access your dashboard, notes, and study tools.</p>
			</header>

			<form className="stack note-form-card auth-card" onSubmit={handleSubmit}>
				<label htmlFor="auth-identifier">
					Email or Username
					<input
						id="auth-identifier"
						value={identifier}
						onChange={(event) => {
							setIdentifier(event.target.value);
							if (fieldErrors.identifier) {
								setFieldErrors((prev) => ({ ...prev, identifier: '' }));
							}
						}}
						placeholder="you@example.com or username"
						autoComplete="username"
					/>
				</label>
				{fieldErrors.identifier ? <p className="error-text field-error">{fieldErrors.identifier}</p> : null}

				<label htmlFor="auth-password">
					Password
					<input
						id="auth-password"
						type="password"
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
							if (fieldErrors.password) {
								setFieldErrors((prev) => ({ ...prev, password: '' }));
							}
						}}
						placeholder="Enter your password"
						autoComplete="current-password"
					/>
				</label>
				{fieldErrors.password ? <p className="error-text field-error">{fieldErrors.password}</p> : null}

				<label htmlFor="remember-me" className="auth-remember-label">
					<input
						id="remember-me"
						type="checkbox"
						checked={rememberMe}
						onChange={(event) => setRememberMe(event.target.checked)}
					/>
					Remember me
				</label>

				{error ? <p className="error-text">{error}</p> : null}

				<div className="button-row">
					<button className="button" type="submit" disabled={loading}>
						{loading ? 'Signing in...' : 'Login'}
					</button>
				</div>

				<p className="meta">
					No account yet? <Link to="/signup">Create one</Link>
				</p>
			</form>
		</section>
	);
}

export default LoginPage;
