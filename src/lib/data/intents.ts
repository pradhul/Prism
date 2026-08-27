import type { Intent } from '$lib/types';

export const intentMeta: Record<Intent, { label: string; hint: string; color: string }> = {
	action: { label: 'Action Required', hint: 'Needs a reply or decision', color: 'text-rose-500' },
	reading: { label: 'Reading', hint: 'Worth a skim, no rush', color: 'text-violet-500' },
	receipt: { label: 'Receipts', hint: 'Confirmations & orders', color: 'text-amber-500' }
};

export const intentOrder: Intent[] = ['action', 'reading', 'receipt'];
