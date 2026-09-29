/**
 * Entry point for re-running Google OAuth for an already signed-in user.
 * `/api/auth/google` picks up the session's email as a login hint and, with
 * prompt=consent + access_type=offline, Google hands back a fresh refresh token.
 */
export function reconnectGmailUrl(next = '/stream'): string {
	const params = new URLSearchParams({ next, reconnect: '1' });
	return `/api/auth/google?${params}`;
}
