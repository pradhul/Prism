export type TextPart =
	| { kind: 'text'; text: string }
	| { kind: 'link'; text: string; href: string; label: string; host: string };

const PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+/gi;
// punctuation that usually belongs to the sentence, not the address
const TRAILING = /[.,;:!?)\]}'"»”’]+$/;
const MAX_LABEL = 48;

function trimTrailing(raw: string): string {
	let url = raw.replace(TRAILING, '');
	// keep a closing paren that is balanced by one inside the URL, e.g. wikipedia.org/wiki/Foo_(bar)
	const cut = raw.slice(url.length);
	if (cut.startsWith(')') && (url.match(/\(/g) ?? []).length > (url.match(/\)/g) ?? []).length) {
		url += ')';
	}
	return url;
}

function hrefFor(text: string): string {
	if (text.includes('@') && !/^(?:https?:\/\/|www\.)/i.test(text)) return `mailto:${text}`;
	return /^www\./i.test(text) ? `https://${text}` : text;
}

function hostOf(href: string): string {
	if (href.startsWith('mailto:')) return href.slice(7).split('@')[1] ?? '';
	try {
		return new URL(href).hostname.replace(/^www\./, '');
	} catch {
		return '';
	}
}

/** A short, readable version of the address for the on-screen text. */
export function linkLabel(text: string): string {
	if (text.includes('@') && !/^(?:https?:\/\/|www\.)/i.test(text)) return text;
	let label = text.replace(/^https?:\/\//i, '').replace(/\/$/, '');
	if (label.length > MAX_LABEL) label = label.slice(0, MAX_LABEL - 1) + '…';
	return label;
}

/** Split a paragraph into plain text and clickable web / email addresses. */
export function linkify(text: string): TextPart[] {
	const parts: TextPart[] = [];
	let last = 0;
	for (const match of text.matchAll(PATTERN)) {
		const start = match.index ?? 0;
		const raw = trimTrailing(match[0]);
		if (!raw) continue;
		// bare "www." or an address with no host is not a link
		if (/^www\.$/i.test(raw) || (!raw.includes('@') && !/[a-z0-9]\.[a-z0-9]/i.test(raw))) continue;
		if (start > last) parts.push({ kind: 'text', text: text.slice(last, start) });
		const href = hrefFor(raw);
		parts.push({ kind: 'link', text: raw, href, label: linkLabel(raw), host: hostOf(href) });
		last = start + raw.length;
	}
	if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
	return parts;
}

export function hasLinks(text: string): boolean {
	return linkify(text).some((p) => p.kind === 'link');
}
