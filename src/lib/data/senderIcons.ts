import {
	siSwiggy,
	siZomato,
	siUbereats,
	siApple,
	siGithub,
	siJira,
	siGoogledrive,
	siGooglecalendar,
	siStripe,
	siMedium,
	siSubstack,
	siNetflix,
	siGmail,
	siGoogle,
	siNotion,
	siFigma,
	siPaypal,
	siSpotify,
	siZoom,
	siDropbox
} from 'simple-icons';

/**
 * Brand marks shown on mail cards so senders are recognizable at a glance —
 * standing in for the logo a real client would pull from the mail itself
 * (BIMI / sender avatar). Most come from simple-icons; brands that aren't in
 * that set (Amazon, Myntra, Flipkart, Slack, …) are hand-drawn approximations.
 */
export interface SenderIcon {
	/** tile background */
	bg: string;
	/** raw inner SVG for a 24×24 viewBox (paths/strokes/text) */
	svg: string;
	/** label for accessibility */
	title: string;
}

const fromSimple = (icon: { path: string; hex: string; title: string }, fg?: string): SenderIcon => ({
	bg: '#ffffff',
	svg: `<path d="${icon.path}" fill="${fg ?? `#${icon.hex}`}"/>`,
	title: icon.title
});

function person(title: string, stroke: string): SenderIcon {
	return {
		bg: '#ffffff',
		title,
		svg: `<circle cx="12" cy="9" r="3.2" fill="none" stroke="${stroke}" stroke-width="1.8"/>
<path d="M5.5 19a6.5 6.5 0 0 1 13 0" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>`
	};
}

const icons: Record<string, SenderIcon> = {
	Amazon: {
		bg: '#ffffff',
		title: 'Amazon',
		svg: `<text x="12" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="#131921">a</text>
<path d="M5.5 16c4 2.7 9.4 2.7 13-.2" fill="none" stroke="#FF9900" stroke-width="1.9" stroke-linecap="round"/>
<path d="M18.6 13.4v2.5H16" fill="none" stroke="#FF9900" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`
	},
	Myntra: {
		bg: '#ffffff',
		title: 'Myntra',
		svg: `<path d="M4 7.5l4.6 9 2.6-5" fill="none" stroke="#FF3F6C" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.8 7.5l4.8 9 5-9" fill="none" stroke="#FF905A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
	},
	Flipkart: {
		bg: '#2874F0',
		title: 'Flipkart',
		svg: `<text x="12" y="17" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" font-weight="800" font-style="italic" fill="#FFE500">f</text>`
	},
	Slack: {
		bg: '#ffffff',
		title: 'Slack',
		svg: `<g stroke-width="2.6" stroke-linecap="round" fill="none">
<path d="M9.2 5.5v6" stroke="#36C5F0"/>
<path d="M14.8 12.5v6" stroke="#2EB67D"/>
<path d="M5.5 14.8h6" stroke="#ECB22E"/>
<path d="M12.5 9.2h6" stroke="#E01E5A"/>
</g>`
	},
	'LinkedIn News': {
		bg: '#0A66C2',
		title: 'LinkedIn',
		svg: `<text x="12" y="16" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#ffffff">in</text>`
	},
	'Morning Brew': {
		bg: '#ffffff',
		title: 'Morning Brew',
		svg: `<path d="M6.5 9h9v5.5a4 4 0 0 1-4 4h-1a4 4 0 0 1-4-4z" fill="none" stroke="#0A2540" stroke-width="1.8" stroke-linejoin="round"/>
<path d="M15.5 10h1.3a2.2 2.2 0 0 1 0 4.4h-1.3" fill="none" stroke="#0A2540" stroke-width="1.8"/>
<path d="M9 6.5V5m3 1.5V5" stroke="#0A2540" stroke-width="1.6" stroke-linecap="round"/>`
	},
	TLDR: {
		bg: '#16181D',
		title: 'TLDR',
		svg: `<text x="12" y="15.5" text-anchor="middle" font-family="Inter, sans-serif" font-size="7.5" font-weight="800" letter-spacing="0.5" fill="#ffffff">TLDR</text>`
	},
	'City Power & Light': {
		bg: '#ffffff',
		title: 'City Power & Light',
		svg: `<path d="M13 3 6 14h5l-1 7 7-11h-5z" fill="#F59E0B"/>`
	},
	'Airline Alerts': {
		bg: '#ffffff',
		title: 'Airline Alerts',
		svg: `<path d="M21 12 3.5 5l3.5 7-3.5 7z" fill="#0EA5E9"/><path d="M7 12h14" stroke="#ffffff" stroke-width="1.4"/>`
	},
	'Security Alerts': {
		bg: '#ffffff',
		title: 'Security Alerts',
		svg: `<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" fill="none" stroke="#1E3A5F" stroke-width="1.8" stroke-linejoin="round"/>
<path d="M9.5 12l2 2 3.5-4" fill="none" stroke="#1E3A5F" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
	},
	'SecureBank Support': {
		bg: '#ffffff',
		title: 'SecureBank',
		svg: `<path d="M12 4l8 5H4z" fill="none" stroke="#64748B" stroke-width="1.7" stroke-linejoin="round"/>
<path d="M6 11v6m4-6v6m4-6v6m4-6v6M4.5 19h15" stroke="#64748B" stroke-width="1.7" stroke-linecap="round"/>`
	},
	'India Post': {
		bg: '#ffffff',
		title: 'India Post',
		svg: `<rect x="3.5" y="6" width="17" height="12" rx="2" fill="none" stroke="#C2410C" stroke-width="1.8"/>
<path d="M4 7.5l8 6 8-6" fill="none" stroke="#C2410C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
	},
	'People Team': {
		bg: '#ffffff',
		title: 'People Team',
		svg: `<circle cx="9" cy="9" r="3" fill="none" stroke="#7C3AED" stroke-width="1.8"/>
<path d="M3.5 19a5.5 5.5 0 0 1 11 0" fill="none" stroke="#7C3AED" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="16.5" cy="10" r="2.3" fill="none" stroke="#A78BFA" stroke-width="1.6"/>
<path d="M14.5 19a4.6 4.6 0 0 1 6 -3.4" fill="none" stroke="#A78BFA" stroke-width="1.6" stroke-linecap="round"/>`
	},
	'Design Team': {
		bg: '#ffffff',
		title: 'Design Team',
		svg: `<path d="M12 3l2.2 4.9L19 9l-4 3.4 1.2 5.1L12 14.8 7.8 17.5 9 12.4 5 9l4.8-1.1z" fill="none" stroke="#DB2777" stroke-width="1.7" stroke-linejoin="round"/>`
	},
	'IT Ops': {
		bg: '#16181D',
		title: 'IT Ops',
		svg: `<path d="M6 9l3 3-3 3" fill="none" stroke="#4ADE80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12 15h6" stroke="#4ADE80" stroke-width="2" stroke-linecap="round"/>`
	},
	Marketing: {
		bg: '#ffffff',
		title: 'Marketing',
		svg: `<path d="M4 13v-2l11-4v10z" fill="none" stroke="#F97316" stroke-width="1.8" stroke-linejoin="round"/>
<path d="M15 8.5a3.5 3.5 0 0 1 0 7M7 13.5l1 5h2.5l-.8-4.4" fill="none" stroke="#F97316" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
	},
	'The Interface': {
		bg: '#1D4ED8',
		title: 'The Interface',
		svg: `<rect x="6" y="6" width="9" height="9" rx="1.5" fill="none" stroke="#ffffff" stroke-width="1.8"/>
<rect x="10" y="10" width="8" height="8" rx="1.5" fill="#93C5FD" stroke="#1D4ED8" stroke-width="1"/>`
	},
	'Marcus Vance': person('Marcus Vance', '#BE123C'),
	'Sarah Jenkins': person('Sarah Jenkins', '#6D28D9'),
	'Alex B.': person('Alex B.', '#0369A1'),
	'Priya (Design)': {
		bg: '#FDF2F8',
		title: 'Priya (Design)',
		svg: `<path d="M7 17l8.5-8.5a1.6 1.6 0 0 1 2.3 2.3L9.3 19.3 5.5 20.5l1.2-3.8z" fill="none" stroke="#DB2777" stroke-width="1.7" stroke-linejoin="round"/>`
	},
	'Priya (Landlord)': {
		bg: '#ECFDF5',
		title: 'Priya (Landlord)',
		svg: `<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1z" fill="none" stroke="#059669" stroke-width="1.7" stroke-linejoin="round"/>`
	},
	'Coach Dana': {
		bg: '#FFF7ED',
		title: 'Coach Dana',
		svg: `<circle cx="12" cy="12" r="6.5" fill="none" stroke="#EA580C" stroke-width="1.8"/>
<path d="M12 8.5v7M9.2 12h5.6" stroke="#EA580C" stroke-width="1.8" stroke-linecap="round"/>`
	},
	'Jordan (Recruiter)': {
		bg: '#EEF2FF',
		title: 'Jordan (Recruiter)',
		svg: `<path d="M8 10V8.5A4 4 0 0 1 16 8.5V10M5 10h14v8.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" fill="none" stroke="#4F46E5" stroke-width="1.7" stroke-linejoin="round"/>`
	},
	'Nina (Manager)': {
		bg: '#F5F3FF',
		title: 'Nina (Manager)',
		svg: `<rect x="5" y="5" width="14" height="14" rx="2" fill="none" stroke="#7C3AED" stroke-width="1.7"/>
<path d="M8 9.5h8M8 13h5.5" stroke="#7C3AED" stroke-width="1.7" stroke-linecap="round"/>`
	},
	'Maya & Tom': {
		bg: '#FDF2F8',
		title: 'Maya & Tom',
		svg: `<circle cx="9" cy="9" r="2.6" fill="none" stroke="#DB2777" stroke-width="1.7"/>
<path d="M4.2 18.5a4.8 4.8 0 0 1 9.6 0" fill="none" stroke="#DB2777" stroke-width="1.7" stroke-linecap="round"/>
<circle cx="16" cy="10" r="2.2" fill="none" stroke="#F472B6" stroke-width="1.6"/>
<path d="M13.4 18.5a4.2 4.2 0 0 1 6.4-3.2" fill="none" stroke="#F472B6" stroke-width="1.6" stroke-linecap="round"/>`
	},
	Swiggy: fromSimple(siSwiggy),
	Zomato: fromSimple(siZomato),
	'Uber Eats': fromSimple(siUbereats),
	Apple: fromSimple(siApple, '#111111'),
	GitHub: fromSimple(siGithub),
	Jira: fromSimple(siJira),
	'Google Drive': fromSimple(siGoogledrive),
	Calendar: fromSimple(siGooglecalendar),
	Stripe: fromSimple(siStripe),
	'Medium Daily': fromSimple(siMedium, '#111111'),
	'Substack Weekly': fromSimple(siSubstack),
	Netflix: fromSimple(siNetflix),
	Gmail: fromSimple(siGmail),
	Google: fromSimple(siGoogle),
	Notion: fromSimple(siNotion, '#111111'),
	Figma: fromSimple(siFigma),
	PayPal: fromSimple(siPaypal),
	LinkedIn: {
		bg: '#0A66C2',
		title: 'LinkedIn',
		svg: `<text x="12" y="16" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="800" fill="#ffffff">in</text>`
	},
	Spotify: fromSimple(siSpotify),
	Zoom: fromSimple(siZoom),
	Dropbox: fromSimple(siDropbox)
};

const keysByLength = Object.keys(icons).sort((a, b) => b.length - a.length);

const FALLBACK_PALETTE = [
	{ bg: '#EEF2FF', fg: '#4338CA' },
	{ bg: '#FDF2F8', fg: '#BE185D' },
	{ bg: '#ECFDF5', fg: '#047857' },
	{ bg: '#FFF7ED', fg: '#C2410C' },
	{ bg: '#F5F3FF', fg: '#6D28D9' },
	{ bg: '#F0F9FF', fg: '#0369A1' },
	{ bg: '#FFF1F2', fg: '#BE123C' },
	{ bg: '#F0FDFA', fg: '#0F766E' }
];

function hashName(value: string): number {
	let h = 0;
	for (let i = 0; i < value.length; i++) h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
	return Math.abs(h);
}

function escapeXml(value: string): string {
	return value.replace(/[<>&'"]/g, (ch) =>
		({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[ch] ?? ch
	);
}

function looksLikePerson(sender: string): boolean {
	return /\(.*\)/.test(sender) || /^[A-Z][a-z]+(?:\s|&|\.)/.test(sender);
}

function fallbackIcon(sender: string, initials?: string): SenderIcon {
	const color = FALLBACK_PALETTE[hashName(sender) % FALLBACK_PALETTE.length];
	if (looksLikePerson(sender)) return person(sender, color.fg);
	const raw = initials ?? sender.replace(/[^A-Za-z0-9]/g, '').slice(0, 2);
	const letter = escapeXml((raw || '?').slice(0, 2).toUpperCase());
	return {
		bg: color.bg,
		title: sender,
		svg: `<text x="12" y="16" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="800" fill="${color.fg}">${letter}</text>`
	};
}

export function senderIcon(sender: string | undefined): SenderIcon | undefined {
	if (!sender) return undefined;
	if (icons[sender]) return icons[sender];
	// tolerate decorated names ("Stripe · Prism") and live variants ("Amazon.in")
	const lower = sender.toLowerCase();
	for (const key of keysByLength) {
		if (key.length < 3) continue;
		if (lower.includes(key.toLowerCase())) return icons[key];
	}
	return undefined;
}

/** Always returns a mark — brand when known, otherwise a stable generated icon. */
export function resolveSenderIcon(sender: string | undefined, initials?: string): SenderIcon {
	return senderIcon(sender) ?? fallbackIcon(sender ?? 'Unknown', initials);
}
