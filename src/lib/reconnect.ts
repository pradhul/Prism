/**
 * Entry point for re-running Google OAuth for an already signed-in user.
 * `/api/auth/google` picks up the session's email as a login hint and, with
 * prompt=consent + access_type=offline, Google hands back a fresh refresh token.
 */
export function reconnectGmailUrl(next = '/stream'): string {
	const params = new URLSearchParams({ next, reconnect: '1' });
	return `/api/auth/google?${params}`;
}

/** The one Gmail permission Prism needs; everything else is identity. */
export const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

/** Google returns granted scopes space-separated; a broader mail scope also satisfies us. */
export function hasGmailScope(scope: string | null | undefined): boolean {
	if (!scope) return false;
	const granted = new Set(scope.split(/\s+/));
	return (
		granted.has(GMAIL_READONLY_SCOPE) ||
		granted.has('https://www.googleapis.com/auth/gmail.modify') ||
		granted.has('https://mail.google.com/')
	);
}

/**
 * Why Gmail needs (re)connecting. Drives the card on the Stream so the user is
 * told the actual fix rather than a generic "try again".
 */
export type ReauthReason = 'insufficient_scope' | 'no_grant' | 'revoked';

export function reauthCopy(reason: ReauthReason | string | undefined): {
	title: string;
	message: string;
	cta: string;
} {
	switch (reason) {
		case 'insufficient_scope':
			return {
				title: 'Gmail permission not granted',
				message:
					'You signed in, but “Read your email” was left unticked on Google’s consent screen. Prism can’t see any mail without it.',
				cta: 'Allow access'
			};
		case 'no_grant':
			return {
				title: 'Gmail isn’t connected',
				message: 'Connect your Gmail account to start streaming real mail.',
				cta: 'Connect Gmail'
			};
		default:
			return {
				title: 'Gmail needs reconnecting',
				message: 'Gmail access expired or was revoked. Reconnect to keep syncing.',
				cta: 'Reconnect'
			};
	}
}
