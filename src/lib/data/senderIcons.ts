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
	siSubstack
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
	'Skyline Airways': {
		bg: '#ffffff',
		title: 'Skyline Airways',
		svg: `<path d="M21 12 3.5 5l3.5 7-3.5 7z" fill="#0EA5E9"/><path d="M7 12h14" stroke="#ffffff" stroke-width="1.4"/>`
	},
	'First National Bank': {
		bg: '#ffffff',
		title: 'First National Bank',
		svg: `<path d="M12 4l8 5H4z" fill="none" stroke="#1E3A5F" stroke-width="1.7" stroke-linejoin="round"/>
<path d="M6 11v6m4-6v6m4-6v6m4-6v6M4.5 19h15" stroke="#1E3A5F" stroke-width="1.7" stroke-linecap="round"/>`
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
	'Substack Weekly': fromSimple(siSubstack)
};

export function senderIcon(sender: string | undefined): SenderIcon | undefined {
	if (!sender) return undefined;
	if (icons[sender]) return icons[sender];
	// tolerate decorated sender names like "Stripe · Prism"
	for (const key in icons) {
		if (sender.startsWith(key)) return icons[key];
	}
	return undefined;
}
