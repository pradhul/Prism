import { searchMail, type SearchHit, type SearchInterpretation } from './inbox.svelte';

/**
 * AI search state lives outside the panel so results survive opening a result
 * in a sheet and coming back.
 */
export const search = $state({
	query: '',
	scopeDays: 30,
	searched: false,
	hits: [] as SearchHit[],
	interpretation: null as SearchInterpretation | null
});

export const searchScopes = [
	{ days: 30, label: 'Past month' },
	{ days: 90, label: '3 months' },
	{ days: 3650, label: 'All time' }
];

export const searchSuggestions = [
	'the pdf marcus sent about the timeline',
	'amazon refund last month',
	'unread newsletters about design',
	'lease renewal from my landlord',
	'boarding pass'
];

export function runSearch(q?: string) {
	if (q !== undefined) search.query = q;
	if (!search.query.trim()) return;
	const res = searchMail(search.query, search.scopeDays);
	search.hits = res.hits;
	search.interpretation = res.interpretation;
	search.searched = true;
}

export function setSearchScope(days: number) {
	search.scopeDays = days;
	if (search.searched) runSearch();
}

export function clearSearch() {
	search.query = '';
	search.searched = false;
	search.hits = [];
	search.interpretation = null;
}
