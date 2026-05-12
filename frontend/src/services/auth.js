const AUTH_STORAGE_KEY = 'student-notebook-auth';

function safeParse(raw) {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

export function getStoredSession() {
	const raw = localStorage.getItem(AUTH_STORAGE_KEY);
	if (!raw) {
		return null;
	}

	const parsed = safeParse(raw);
	if (!parsed?.token) {
		return null;
	}

	return {
		token: parsed.token,
		user: parsed.user || null,
	};
}

export function getAuthToken() {
	return getStoredSession()?.token || null;
}

export function setStoredSession(session) {
	localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
	localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated() {
	return Boolean(getAuthToken());
}
