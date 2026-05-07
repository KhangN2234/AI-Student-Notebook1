import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/api';
import { setStoredSession } from '../services/auth';

function SignupPage() {
	const navigate = useNavigate();

	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [fieldErrors, setFieldErrors] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	function validate() {
		const nextErrors = {
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
		};

		if (!username.trim()) {
			nextErrors.username = 'Username is required.';
		}

		if (!email.trim()) {
			nextErrors.email = 'Email is required.';
		} else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
			nextErrors.email = 'Enter a valid email address.';
		}

		if (!password) {
			nextErrors.password = 'Password is required.';
		} else if (password.length < 8) {
			nextErrors.password = 'Password must be at least 8 characters.';
		}

		if (!confirmPassword) {
			nextErrors.confirmPassword = 'Please confirm your password.';
		} else if (password !== confirmPassword) {
			nextErrors.confirmPassword = 'Passwords do not match.';
		}

		setFieldErrors(nextErrors);
		return Object.values(nextErrors).every((value) => !value);
	}

	async function handleSubmit(event) {
		event.preventDefault();
		if (!validate()) {
			return;
		}

		try {
			setLoading(true);
			setError('');
			const data = await signup({
				username: username.trim(),
				email: email.trim(),
				password,
			});
			setStoredSession({ token: data.token, user: data.user, rememberMe: true });
			navigate('/', { replace: true });
		} catch (err) {
			setError(err.message || 'Unable to create account.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="note-page auth-page">
			<header className="note-page-header">
				<h2>Create Account</h2>
				<p className="lead">Create your account to save and organize study notes.</p>
			</header>

			<form className="stack note-form-card auth-card" onSubmit={handleSubmit}>
				<label htmlFor="signup-username">
					Username
					<input
						id="signup-username"
						value={username}
						onChange={(event) => {
							setUsername(event.target.value);
							if (fieldErrors.username) {
								setFieldErrors((prev) => ({ ...prev, username: '' }));
							}
						}}
						placeholder="yourusername"
						autoComplete="username"
					/>
				</label>
				{fieldErrors.username ? <p className="error-text field-error">{fieldErrors.username}</p> : null}

				<label htmlFor="signup-email">
					Email
					<input
						id="signup-email"
						type="email"
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);
							if (fieldErrors.email) {
								setFieldErrors((prev) => ({ ...prev, email: '' }));
							}
						}}
						placeholder="you@example.com"
						autoComplete="email"
					/>
				</label>
				{fieldErrors.email ? <p className="error-text field-error">{fieldErrors.email}</p> : null}

				<label htmlFor="signup-password">
					Password
					<input
						id="signup-password"
						type="password"
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
							if (fieldErrors.password) {
								setFieldErrors((prev) => ({ ...prev, password: '' }));
							}
						}}
						placeholder="At least 8 characters"
						autoComplete="new-password"
					/>
				</label>
				{fieldErrors.password ? <p className="error-text field-error">{fieldErrors.password}</p> : null}

				<label htmlFor="signup-confirm-password">
					Confirm Password
					<input
						id="signup-confirm-password"
						type="password"
						value={confirmPassword}
						onChange={(event) => {
							setConfirmPassword(event.target.value);
							if (fieldErrors.confirmPassword) {
								setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
							}
						}}
						placeholder="Re-enter your password"
						autoComplete="new-password"
					/>
				</label>
				{fieldErrors.confirmPassword ? <p className="error-text field-error">{fieldErrors.confirmPassword}</p> : null}

				{error ? <p className="error-text">{error}</p> : null}

				<div className="button-row">
					<button className="button" type="submit" disabled={loading}>
						{loading ? 'Creating account...' : 'Sign Up'}
					</button>
				</div>

				<p className="meta">
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</section>
	);
}

export default SignupPage;
