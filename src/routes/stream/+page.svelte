<script lang="ts">
	import { fade, fly, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut, expoOut } from 'svelte/easing';
	import {
		inbox,
		getThread,
		deleteThread,
		markDone,
		markRead,
		markUnread,
		setLiveThreads,
		syncLiveInbox,
		useDemoInbox,
		ReauthRequiredError
	} from '$lib/state/inbox.svelte';
	import { reconnectGmailUrl } from '$lib/reconnect';
	import { effectiveTags, tagMeta, tagStore, deleteTagged } from '$lib/state/organize.svelte';
	import {
		openThread,
		openSearch,
		openManage,
		closeSheet,
		expandSheet,
		sheetFullHref,
		searchSheetVisible,
		isOwnSheet,
		dismissStaleSheet
	} from '$lib/state/sheet.svelte';
	import { groupMeta } from '$lib/data/groups';
	import type { Group } from '$lib/types';
	import StreamBubble from '$lib/components/stream/StreamBubble.svelte';
	import OrderMerchantGroup from '$lib/components/stream/OrderMerchantGroup.svelte';
	import ThreadDetail from '$lib/components/stream/ThreadDetail.svelte';
	import SearchPanel from '$lib/components/search/SearchPanel.svelte';
	import ManagePanel from '$lib/components/manage/ManagePanel.svelte';
	import Sheet from '$lib/components/shared/Sheet.svelte';
	import PrismMark from '$lib/components/shared/PrismMark.svelte';
	import Avatar from '$lib/components/shared/Avatar.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data } = $props();

	$effect(() => {
		if (data.live && data.threads) {
			setLiveThreads(data.threads);
		} else if (!data.live && inbox.source === 'gmail') {
			useDemoInbox();
		}
	});

	$effect(() => {
		if (!data.live) return;
		if (page.url.searchParams.get('sync') !== '1') return;
		if (inbox.syncing || reauth) return;
		void (async () => {
			try {
				await syncLiveInbox();
				await goto('/stream', { replaceState: true });
			} catch (err) {
				failSync(err);
			}
		})();
	});

	let filter = $state<'unread' | 'all'>('unread');
	let tagFilter = $state<string | null>(null);
	let confirmDelete = $state(false);
	let showDone = $state(false);
	let catchupLimit = $state(6);
	let otherLimit = $state(10);
	let syncError = $state<string | null>(null);
	// Google stopped honouring our grant: show the reconnect card instead of retrying.
	// Seeded from the server (grant row gone) and set again if a sync trips on it.
	let syncReauth = $state<{ message: string; reconnectUrl: string } | null>(null);
	const reauth = $derived(
		syncReauth ??
			(data.live && data.needsReauth
				? { message: 'Gmail access expired or was revoked. Reconnect to keep syncing.', reconnectUrl: reconnectGmailUrl('/stream') }
				: null)
	);

	function failSync(err: unknown) {
		if (err instanceof ReauthRequiredError) {
			syncReauth = { message: err.message, reconnectUrl: err.reconnectUrl };
			syncError = null;
			return;
		}
		syncError = err instanceof Error ? err.message : 'Sync failed';
	}

	const allLive = $derived(inbox.threads.filter((t) => !t.archived));
	const totalCount = $derived(allLive.length);
	const unreadCount = $derived(allLive.filter((t) => t.unread).length);
	const isGmail = $derived(inbox.source === 'gmail');

	// with a tag selected, every section narrows to mail carrying that tag
	const live = $derived(
		tagFilter === null ? allLive : allLive.filter((t) => effectiveTags(t).includes(tagFilter!))
	);
	const taggedCount = $derived(tagFilter === null ? 0 : live.length);
	const taggedUnread = $derived(tagFilter === null ? 0 : live.filter((t) => t.unread).length);

	const unreadByGroup = $derived.by(() => {
		const map: Record<Group, number> = { action: 0, orders: 0, catchup: 0, other: 0 };
		for (const t of live) if (t.unread) map[t.group]++;
		return map;
	});

	// the overlay currently open (thread / search / tags), driven by shallow routing;
	// entries left behind by a reload are not ours and get cleared instead of shown
	const sheet = $derived(page.state.sheet && isOwnSheet(page.state.sheet) ? page.state.sheet : undefined);
	$effect(() => {
		if (page.state.sheet) dismissStaleSheet();
	});
	const sheetThread = $derived(sheet?.kind === 'thread' ? getThread(sheet.id) : undefined);

	function pickTag(name: string) {
		tagFilter = tagFilter === name ? null : name;
		confirmDelete = false;
	}

	function readAllTagged() {
		for (const t of live) if (t.unread) markRead(t.id);
	}

	function readVisibleGroup(group: Group) {
		for (const t of live) if (t.group === group && t.unread) markRead(t.id);
	}

	function toggleRead(id: string, unread: boolean) {
		if (unread) markRead(id);
		else markUnread(id);
	}

	function deleteAllTagged() {
		if (!tagFilter) return;
		if (!confirmDelete) {
			confirmDelete = true;
			return;
		}
		deleteTagged(tagFilter);
		confirmDelete = false;
	}

	async function refresh() {
		if (reauth) return;
		syncError = null;
		try {
			await syncLiveInbox();
		} catch (err) {
			failSync(err);
		}
	}

	// Needs Action always shows pending mail read or unread (past 2 weeks) —
	// being read doesn't mean the action was taken.
	const actionPending = $derived(
		live.filter((t) => t.group === 'action' && !t.done && t.daysAgo <= 14).sort((a, b) => a.daysAgo - b.daysAgo)
	);
	const actionDone = $derived(live.filter((t) => t.group === 'action' && t.done));

	const orders = $derived(
		live.filter((t) => t.group === 'orders' && t.daysAgo <= 30 && (filter === 'all' || t.unread))
	);
	const merchantGroups = $derived.by(() => {
		const map = new Map<string, typeof orders>();
		for (const t of orders) {
			const key = t.merchant ?? 'Other';
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(t);
		}
		return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
	});

	const catchup = $derived(
		live
			.filter((t) => t.group === 'catchup' && (filter === 'all' || t.unread))
			.sort((a, b) => a.daysAgo - b.daysAgo)
	);
	const other = $derived(
		live
			.filter((t) => t.group === 'other' && (filter === 'all' || t.unread))
			.sort((a, b) => a.daysAgo - b.daysAgo)
	);

	const listIn = { y: 14, duration: 340, easing: expoOut };
	const listOut = { duration: 180, easing: cubicOut };
	const listFlip = { duration: 300, easing: cubicOut };
</script>

<svelte:head>
	<title>Prism — Stream</title>
</svelte:head>

{#snippet readAll(group: Group)}
	{@const n = unreadByGroup[group]}
	<button
		type="button"
		disabled={n === 0}
		onclick={() => readVisibleGroup(group)}
		class="tap-scale flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 ring-black/[0.05] {n > 0
			? 'bg-white text-violet-600 shadow-glass'
			: 'bg-white/40 text-neutral-400'}"
	>
		{#if n > 0}
			Read all
		{:else}
			<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none">
				<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			All read
		{/if}
	</button>
{/snippet}

<div class="relative flex h-dvh w-full flex-col bg-paper">
	<div class="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-violet-100/70 via-paper to-paper"></div>

	<header class="safe-top rise relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
		<div class="flex items-center gap-2">
			<PrismMark size={22} />
			<span class="font-serif text-base font-medium text-ink">Prism</span>
			{#if isGmail}
				<span
					class="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase ring-1 ring-emerald-100"
				>
					Gmail
				</span>
			{/if}
		</div>
		<div class="flex items-center gap-2">
			{#if isGmail}
				<button
					type="button"
					onclick={refresh}
					disabled={inbox.syncing || reauth !== null}
					aria-label="Refresh Gmail"
					class="glass tap-scale tap-icon flex h-9 w-9 items-center justify-center rounded-full text-ink shadow-glass ring-1 ring-black/5 disabled:opacity-50"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4 {inbox.syncing ? 'animate-spin' : ''}" fill="none">
						<path
							d="M4 12a8 8 0 0 1 14.2-5M20 12a8 8 0 0 1-14.2 5"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
						/>
						<path
							d="M18 3v4h-4M6 21v-4h4"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			{/if}
			<button
				type="button"
				onclick={openSearch}
				aria-label="AI search"
				class="glass tap-scale tap-icon flex h-9 w-9 items-center justify-center rounded-full text-ink shadow-glass ring-1 ring-black/5"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
					<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
					<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
				</svg>
			</button>
			<button
				type="button"
				onclick={openManage}
				aria-label="Tags and rules"
				class="glass tap-scale tap-icon flex h-9 w-9 items-center justify-center rounded-full text-ink shadow-glass ring-1 ring-black/5"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
					<path
						d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					/>
					<circle cx="7.5" cy="7.5" r="0.6" fill="currentColor" stroke="currentColor" />
				</svg>
			</button>
		</div>
	</header>

	<div class="rise relative z-10 px-5 pb-1" style="--rise-delay: 60ms">
		<h1 class="font-serif text-2xl font-medium tracking-tight text-ink">Good morning</h1>
		<p class="mt-0.5 text-sm text-neutral-500">
			<span class="font-semibold text-ink">{totalCount.toLocaleString()} mails</span> ·
			{#key unreadCount}
				<span class="pop inline-block font-semibold text-violet-600">{unreadCount} unread</span>
			{/key}
			— grouped by what they need from you, not where they're filed.
		</p>
		{#if !page.data.user}
			<p class="mt-2 text-[12px] text-neutral-400">
				Demo mailbox.
				<a class="font-semibold text-violet-600 underline" href="/api/auth/google?next=/stream">Connect Gmail</a>
			</p>
		{/if}
		{#if reauth}
			<div
				class="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-glass ring-1 ring-amber-200"
				transition:slide={{ duration: 240, easing: cubicOut }}
				role="alert"
			>
				<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
						<path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18.2A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</span>
				<div class="min-w-0 flex-1">
					<p class="text-[13px] font-semibold text-ink">Gmail needs reconnecting</p>
					<p class="text-[11.5px] leading-snug text-neutral-500">{reauth.message}</p>
				</div>
				<a
					href={reauth.reconnectUrl}
					data-sveltekit-reload
					class="tap-scale shrink-0 rounded-full bg-ink px-3.5 py-2 text-[12px] font-semibold text-white"
				>
					Reconnect
				</a>
			</div>
		{:else if syncError}
			<p class="mt-2 text-[12px] text-rose-600" transition:slide={{ duration: 200 }}>{syncError}</p>
		{/if}
	</div>

	<div class="no-scrollbar rise relative z-10 mt-3 flex items-center gap-2 overflow-x-auto px-5 pb-3" style="--rise-delay: 120ms">
		<div class="glass flex shrink-0 rounded-full p-1 ring-1 ring-black/[0.06]">
			<button
				type="button"
				onclick={() => (filter = 'unread')}
				class="tap-scale rounded-full px-3.5 py-1.5 text-xs font-semibold {filter === 'unread'
					? 'bg-ink text-white'
					: 'text-neutral-500'}"
			>
				Unread · {unreadCount}
			</button>
			<button
				type="button"
				onclick={() => (filter = 'all')}
				class="tap-scale rounded-full px-3.5 py-1.5 text-xs font-semibold {filter === 'all'
					? 'bg-ink text-white'
					: 'text-neutral-500'}"
			>
				All mail
			</button>
		</div>

		{#each tagStore.tags as tag (tag.name)}
			<button
				type="button"
				onclick={() => pickTag(tag.name)}
				class="tap-scale flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ring-1 {tagFilter === tag.name
					? 'bg-ink text-white ring-ink'
					: `${tag.pill}`}"
				in:fly={{ x: 10, duration: 260, easing: expoOut }}
				out:fade={{ duration: 120 }}
				animate:flip={listFlip}
			>
				<span class="h-1.5 w-1.5 rounded-full {tagFilter === tag.name ? 'bg-white' : tag.dot}"></span>
				{tag.name}
			</button>
		{/each}
	</div>

	{#if tagFilter}
		<div
			class="relative z-10 mx-5 mb-2 flex items-center gap-2 rounded-2xl bg-white/80 px-3.5 py-2.5 shadow-glass ring-1 ring-black/[0.05]"
			transition:slide={{ duration: 240, easing: cubicOut }}
		>
			<p class="min-w-0 flex-1 truncate text-[12px] text-neutral-500">
				<span class="font-bold text-ink">{taggedCount.toLocaleString()}</span> mails tagged
				<span class="font-semibold {tagMeta(tagFilter).pill.split(' ')[1]}">{tagFilter}</span>
			</p>
			{#if taggedUnread > 0}
				<button
					type="button"
					onclick={readAllTagged}
					class="tap-scale shrink-0 rounded-full bg-violet-50 px-3 py-1.5 text-[11px] font-semibold text-violet-600 ring-1 ring-violet-100"
					transition:fade={{ duration: 140 }}
				>
					Read all
				</button>
			{/if}
			<button
				type="button"
				onclick={deleteAllTagged}
				class="tap-scale shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 {confirmDelete
					? 'bg-rose-500 text-white ring-rose-500'
					: 'bg-rose-50 text-rose-500 ring-rose-100'}"
			>
				{confirmDelete ? `Sure? Delete ${taggedCount}` : 'Delete all'}
			</button>
			<button
				type="button"
				onclick={() => pickTag(tagFilter!)}
				aria-label="Clear tag filter"
				class="tap-scale tap-icon flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
			>
				<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none">
					<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	{/if}

	<div class="no-scrollbar rise relative flex-1 overflow-y-auto px-5 pb-28" style="--rise-delay: 180ms">
		<div class="pointer-events-none absolute top-0 bottom-8 left-[26px] w-px bg-gradient-to-b from-violet-200 via-neutral-200 to-transparent"></div>

		<!-- Needs Action -->
		<div class="relative pt-2 pb-1">
			<div class="sticky top-0 z-20 -mx-1 mb-1 flex items-center gap-2 rounded-2xl bg-paper/90 px-1 py-1.5 pl-[7px] backdrop-blur-sm">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-rose-500"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.action.label}</h2>
				{#key actionPending.length}
					<span class="pop rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-600">{actionPending.length}</span>
				{/key}
				<span class="flex-1"></span>
				{@render readAll('action')}
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.action.hint}. Mark ✓ done and it disappears.</p>

			<div class="flex flex-col gap-3 pl-8">
				{#each actionPending as thread (thread.id)}
					<div in:fly={listIn} out:fade={listOut} animate:flip={listFlip}>
						<StreamBubble {thread} />
					</div>
				{/each}
				{#if actionPending.length === 0}
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400" in:fade={{ duration: 240, delay: 120 }}>
						All handled — nothing waiting on you 🎉
					</p>
				{/if}

				{#if actionDone.length > 0}
					<button
						type="button"
						onclick={() => (showDone = !showDone)}
						class="tap-scale flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50/70 py-2.5 text-[12px] font-semibold text-emerald-600 ring-1 ring-emerald-100"
						transition:slide={{ duration: 220 }}
					>
						<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
							<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						{actionDone.length} done — {showDone ? 'hide' : 'show'}
					</button>
					{#if showDone}
						<div class="flex flex-col gap-3" transition:slide={{ duration: 240, easing: cubicOut }}>
							{#each actionDone as t (t.id)}
								<div class="flex items-center gap-2.5 rounded-2xl bg-white/40 px-4 py-3 opacity-70" out:fade={listOut} animate:flip={listFlip}>
									<p class="min-w-0 flex-1 truncate text-[12.5px] text-neutral-400 line-through">{t.subject}</p>
									<button
										type="button"
										onclick={() => markDone(t.id, false)}
										class="tap-scale shrink-0 text-[11.5px] font-semibold text-violet-500"
									>
										Undo
									</button>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Orders & Deliveries -->
		<div class="relative pt-6 pb-1">
			<div class="sticky top-0 z-20 -mx-1 mb-1 flex items-center gap-2 rounded-2xl bg-paper/90 px-1 py-1.5 pl-[7px] backdrop-blur-sm">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-amber-500"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.orders.label}</h2>
				{#key orders.length}
					<span class="pop rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">{orders.length}</span>
				{/key}
				<span class="text-[11px] text-neutral-400">· 30 days</span>
				<span class="flex-1"></span>
				{@render readAll('orders')}
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.orders.hint}.</p>

			<div class="flex flex-col gap-3 pl-8">
				{#each merchantGroups as [merchant, items] (merchant)}
					<div in:fly={listIn} out:fade={listOut} animate:flip={listFlip}>
						<OrderMerchantGroup {merchant} {items} />
					</div>
				{/each}
				{#if merchantGroups.length === 0}
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400" in:fade={{ duration: 240, delay: 120 }}>
						{filter === 'unread' ? 'No unread order mail. Switch to “All mail” to browse past orders.' : 'No order mail in the last 30 days.'}
					</p>
				{/if}
			</div>
		</div>

		<!-- Catch Up -->
		<div class="relative pt-6 pb-1">
			<div class="sticky top-0 z-20 -mx-1 mb-1 flex items-center gap-2 rounded-2xl bg-paper/90 px-1 py-1.5 pl-[7px] backdrop-blur-sm">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-violet-500"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.catchup.label}</h2>
				{#key catchup.length}
					<span class="pop rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-600">{catchup.length}</span>
				{/key}
				<span class="flex-1"></span>
				{@render readAll('catchup')}
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.catchup.hint}.</p>

			<div class="flex flex-col gap-3 pl-8">
				{#each catchup.slice(0, catchupLimit) as thread (thread.id)}
					<div in:fly={listIn} out:fade={listOut} animate:flip={listFlip}>
						<StreamBubble {thread} />
					</div>
				{/each}
				{#if catchup.length > catchupLimit}
					<button
						type="button"
						onclick={() => (catchupLimit += 12)}
						class="tap-scale rounded-2xl bg-white/60 py-3 text-center text-[12px] font-semibold text-violet-500 ring-1 ring-black/[0.04]"
					>
						Show {Math.min(12, catchup.length - catchupLimit)} more of {catchup.length - catchupLimit}
					</button>
				{/if}
				{#if catchup.length === 0}
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400" in:fade={{ duration: 240, delay: 120 }}>
						You're all caught up.
					</p>
				{/if}
			</div>
		</div>

		<!-- Everything Else -->
		<div class="relative pt-6 pb-1">
			<div class="sticky top-0 z-20 -mx-1 mb-1 flex items-center gap-2 rounded-2xl bg-paper/90 px-1 py-1.5 pl-[7px] backdrop-blur-sm">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-slate-300"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.other.label}</h2>
				{#key other.length}
					<span class="pop rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{other.length}</span>
				{/key}
				<span class="flex-1"></span>
				{@render readAll('other')}
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.other.hint}.</p>

			<div class="flex flex-col gap-1 pl-8">
				{#each other.slice(0, otherLimit) as t (t.id)}
					<div
						class="flex items-center gap-1 rounded-xl transition-[background-color,opacity] duration-300 {t.unread ? 'bg-white/70' : 'opacity-50'}"
						in:fly={{ x: -10, duration: 260, easing: expoOut }}
						out:slide={{ duration: 200, easing: cubicOut }}
						animate:flip={listFlip}
					>
						<button
							type="button"
							onclick={() => openThread(t.id)}
							class="tap-scale flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left"
						>
							<Avatar initials={t.senderInitials} sender={t.sender} classes={t.avatar} size="sm" />
							<span class="min-w-0 flex-1 truncate text-[12.5px] {t.unread ? 'font-medium text-ink' : 'text-neutral-500'}">
								<span class="font-semibold">{t.sender}</span> — {t.subject}
							</span>
							<span class="shrink-0 text-[10.5px] text-neutral-400">{t.timestamp}</span>
						</button>
						<button
							type="button"
							onclick={() => toggleRead(t.id, t.unread)}
							aria-label={t.unread ? `Mark ${t.subject} as read` : `Mark ${t.subject} as unread`}
							class="tap-scale tap-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors {t.unread
								? 'text-violet-500 hover:bg-violet-50'
								: 'text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500'}"
						>
							{#if t.unread}
								<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
									<path d="M3 8l9 6 9-6M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
									<path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
									<circle cx="18" cy="6" r="3" fill="#7c3aed" stroke="white" stroke-width="1.5" />
								</svg>
							{/if}
						</button>
						<button
							type="button"
							onclick={() => deleteThread(t.id)}
							aria-label={`Delete ${t.subject}`}
							class="tap-scale tap-icon mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
						>
							<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
								<path
									d="M4 7h16M10 11v6m4-6v6M6 7l1 13a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
									stroke="currentColor"
									stroke-width="1.8"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					</div>
				{/each}
				{#if other.length > otherLimit}
					<button
						type="button"
						onclick={() => (otherLimit += 25)}
						class="tap-scale mt-1 rounded-2xl bg-white/60 py-3 text-center text-[12px] font-semibold text-violet-500 ring-1 ring-black/[0.04]"
					>
						Show {Math.min(25, other.length - otherLimit)} more of {other.length - otherLimit}
					</button>
				{/if}
				{#if other.length === 0}
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400" in:fade={{ duration: 240, delay: 120 }}>
						Nothing else — quiet day.
					</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Sheets: detail / search / tags open in place; Back (or swipe down) closes them -->
	{#if searchSheetVisible(sheet)}
		<Sheet
			title="Ask your inbox"
			subtitle="Describe it loosely — Prism figures out the rest"
			fullHref="/search"
			onexpand={expandSheet}
			onclose={closeSheet}
			stacked={sheet?.kind !== 'search'}
		>
			<SearchPanel autofocus onOpenThread={(id) => openThread(id, 'search')} />
		</Sheet>
	{/if}
	{#if sheet?.kind === 'thread'}
		{#key sheet.id}
			{#if sheetThread}
				<Sheet
					title={sheetThread.sender}
					subtitle="{sheetThread.messages.length} {sheetThread.messages.length === 1 ? 'message' : 'messages'} · {sheetThread.timestamp}"
					fullHref={sheetFullHref(sheet)}
					onexpand={expandSheet}
					onclose={closeSheet}
				>
					<ThreadDetail thread={sheetThread} variant="sheet" onclose={closeSheet} />
				</Sheet>
			{:else}
				<Sheet title="Mail" onclose={closeSheet}>
					<p class="px-5 py-8 text-center text-sm text-neutral-500">That thread wandered off.</p>
				</Sheet>
			{/if}
		{/key}
	{:else if sheet?.kind === 'manage'}
		<Sheet
			title="Tags & Rules"
			subtitle="How your mail gets organized — nothing hidden"
			fullHref={sheetFullHref(sheet)}
			onexpand={expandSheet}
			onclose={closeSheet}
		>
			<ManagePanel />
		</Sheet>
	{/if}
</div>
