import { pushState, goto } from '$app/navigation';
import { page } from '$app/state';

/**
 * In-place overlays ("sheets") on the Stream: thread detail, AI search, tags & rules.
 *
 * Backed by SvelteKit shallow routing so the URL stays on /stream, the browser Back
 * button (and swipe-back) closes the sheet, and nothing reloads. Sheets stack
 * (search → a result) and Back peels one layer at a time; search state lives in a
 * store so the results are still there. A "full page" link inside each sheet still
 * lets people jump to /stream/[id], /search or /manage.
 */

export type Sheet = NonNullable<App.PageState['sheet']>;

export function currentSheet(): Sheet | undefined {
	return page.state.sheet;
}

function show(sheet: Sheet) {
	pushState('', { sheet });
}

export function openThread(id: string, under?: 'search') {
	show(under ? { kind: 'thread', id, under } : { kind: 'thread', id });
}

/** true while a thread sheet opened from search is stacked on top of it */
export function searchSheetVisible(sheet: Sheet | undefined): boolean {
	return sheet?.kind === 'search' || (sheet?.kind === 'thread' && sheet.under === 'search');
}

export function openSearch() {
	show({ kind: 'search' });
}

export function openManage() {
	show({ kind: 'manage' });
}

/** Sheets only exist as pushed history entries, so closing is just going back. */
export function closeSheet() {
	if (!page.state.sheet) return;
	history.back();
}

export function sheetFullHref(sheet: Sheet): string {
	switch (sheet.kind) {
		case 'thread':
			return `/stream/${encodeURIComponent(sheet.id)}`;
		case 'search':
			return '/search';
		case 'manage':
			return '/manage';
	}
}

/** Leave the sheet and open the same content as its own page. */
export function expandSheet() {
	const sheet = page.state.sheet;
	if (!sheet) return;
	void goto(sheetFullHref(sheet));
}
