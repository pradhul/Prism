import { pushState, replaceState, goto } from '$app/navigation';
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

function key(sheet: Sheet): string {
	return sheet.kind === 'thread' ? `thread:${sheet.id}:${sheet.under ?? ''}` : sheet.kind;
}

// Sheets pushed since this page was loaded. SvelteKit empties page.state on a
// reload but keeps the history entry, so without this a stale entry would pop a
// sheet back open the next time the user goes Back.
const opened = new Set<string>();

function show(sheet: Sheet) {
	opened.add(key(sheet));
	pushState('', { sheet });
}

/** True when the sheet in page.state was opened by this page session (not a leftover entry). */
export function isOwnSheet(sheet: Sheet): boolean {
	return opened.has(key(sheet));
}

/**
 * Call from the Stream when page.state changes: a sheet we never opened here is a
 * leftover from before a reload — clear it in place rather than showing it.
 */
export function dismissStaleSheet(): boolean {
	const sheet = page.state.sheet;
	if (!sheet || isOwnSheet(sheet)) return false;
	replaceState('', {});
	return true;
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

/**
 * Sheets exist as pushed history entries, so closing is going back. If the entry
 * somehow isn't ours (restored after a reload), clear the state in place instead so
 * Back never carries the user off the Stream.
 */
export function closeSheet() {
	const sheet = page.state.sheet;
	if (!sheet) return;
	if (!isOwnSheet(sheet)) {
		replaceState('', {});
		return;
	}
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
