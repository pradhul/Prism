import { getAppUrl, requireEnv } from '$lib/server/env';

const SCOPES = [
	'openid',
	'email',
	'profile',
	'https://www.googleapis.com/auth/gmail.readonly'
].join(' ');

/**
 * Google refused the grant in a way that only the user can fix by signing in
 * again: the refresh token was revoked, expired (7 days for apps in "testing"),
 * the password changed, or the account was removed.
 */
export class GoogleReauthRequiredError extends Error {
	readonly code = 'reauth_required' as const;
	constructor(
		public readonly reason: string,
		message = 'Gmail needs to be reconnected'
	) {
		super(message);
		this.name = 'GoogleReauthRequiredError';
	}
}

export function isReauthRequired(err: unknown): err is GoogleReauthRequiredError {
	return err instanceof GoogleReauthRequiredError;
}

/** OAuth error codes that mean "this grant is dead" rather than "we misconfigured something". */
const DEAD_GRANT_CODES = new Set(['invalid_grant', 'unauthorized_client']);

export function googleAuthUrl(state: string, loginHint?: string): string {
	const params = new URLSearchParams({
		client_id: requireEnv('GOOGLE_CLIENT_ID'),
		redirect_uri: `${getAppUrl()}/api/auth/callback/google`,
		response_type: 'code',
		scope: SCOPES,
		access_type: 'offline',
		prompt: 'consent',
		include_granted_scopes: 'true',
		state
	});
	// preselect the account when we're reconnecting a known user
	if (loginHint) params.set('login_hint', loginHint);
	return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export interface GoogleTokenResponse {
	access_token: string;
	expires_in: number;
	refresh_token?: string;
	scope?: string;
	token_type: string;
	id_token?: string;
}

export async function exchangeCode(code: string): Promise<GoogleTokenResponse> {
	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			code,
			client_id: requireEnv('GOOGLE_CLIENT_ID'),
			client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
			redirect_uri: `${getAppUrl()}/api/auth/callback/google`,
			grant_type: 'authorization_code'
		})
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Token exchange failed: ${res.status} ${text}`);
	}
	return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
	const res = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			refresh_token: refreshToken,
			client_id: requireEnv('GOOGLE_CLIENT_ID'),
			client_secret: requireEnv('GOOGLE_CLIENT_SECRET'),
			grant_type: 'refresh_token'
		})
	});
	if (!res.ok) {
		const text = await res.text();
		let code = '';
		let description = '';
		try {
			const body = JSON.parse(text) as { error?: string; error_description?: string };
			code = body.error ?? '';
			description = body.error_description ?? '';
		} catch {
			// not JSON — fall through to the generic error
		}
		if (DEAD_GRANT_CODES.has(code)) {
			throw new GoogleReauthRequiredError(`${code}${description ? `: ${description}` : ''}`);
		}
		throw new Error(`Token refresh failed: ${res.status} ${text}`);
	}
	return res.json();
}

export interface GoogleProfile {
	sub: string;
	email: string;
	name?: string;
	picture?: string;
	email_verified?: boolean;
}

export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
	const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Profile fetch failed: ${res.status} ${text}`);
	}
	return res.json();
}
