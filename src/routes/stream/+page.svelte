<script lang="ts">
	import {
		inbox,
		markDone,
		markGroupRead,
		setLiveThreads,
		syncLiveInbox,
		useDemoInbox
	} from '$lib/state/inbox.svelte';
	import { groupMeta } from '$lib/data/groups';
	import StreamBubble from '$lib/components/stream/StreamBubble.svelte';
	import OrderMerchantGroup from '$lib/components/stream/OrderMerchantGroup.svelte';
	import PrismMark from '$lib/components/shared/PrismMark.svelte';
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
		if (inbox.syncing) return;
		void (async () => {
			try {
				await syncLiveInbox();
				await goto('/stream', { replaceState: true });
			} catch (err) {
				syncError = err instanceof Error ? err.message : 'Sync failed';
			}
		})();
	});

	let filter = $state<'unread' | 'all'>('unread');
	let showDone = $state(false);
	let catchupLimit = $state(6);
	let otherLimit = $state(10);
	let syncError = $state<string | null>(null);

	const live = $derived(inbox.threads.filter((t) => !t.archived));
	const totalCount = $derived(live.length);
	const unreadCount = $derived(live.filter((t) => t.unread).length);
	const isGmail = $derived(inbox.source === 'gmail');

	async function refresh() {
		syncError = null;
		try {
			await syncLiveInbox();
		} catch (err) {
			syncError = err instanceof Error ? err.message : 'Sync failed';
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
	const catchupUnread = $derived(live.filter((t) => t.group === 'catchup' && t.unread).length);

	const other = $derived(
		live
			.filter((t) => t.group === 'other' && (filter === 'all' || t.unread))
			.sort((a, b) => a.daysAgo - b.daysAgo)
	);
</script>

<svelte:head>
	<title>Prism — Stream</title>
</svelte:head>

<div class="relative flex h-dvh w-full flex-col bg-paper">
	<div class="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-violet-100/70 via-paper to-paper"></div>

	<header class="safe-top relative z-10 flex items-center justify-between px-5 pt-5 pb-3">
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
					disabled={inbox.syncing}
					aria-label="Refresh Gmail"
					class="glass tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink shadow-glass ring-1 ring-black/5 disabled:opacity-50"
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
				onclick={() => goto('/search')}
				aria-label="AI search"
				class="glass tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink shadow-glass ring-1 ring-black/5"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
					<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
					<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
				</svg>
			</button>
			<button
				type="button"
				onclick={() => goto('/manage')}
				aria-label="Tags and rules"
				class="glass tap-scale flex h-9 w-9 items-center justify-center rounded-full text-ink shadow-glass ring-1 ring-black/5"
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

	<div class="relative z-10 px-5 pb-1">
		<h1 class="font-serif text-2xl font-medium tracking-tight text-ink">Good morning</h1>
		<p class="mt-0.5 text-sm text-neutral-500">
			<span class="font-semibold text-ink">{totalCount.toLocaleString()} mails</span> ·
			<span class="font-semibold text-violet-600">{unreadCount} unread</span> — grouped by what they need
			from you, not where they're filed.
		</p>
		{#if !page.data.user}
			<p class="mt-2 text-[12px] text-neutral-400">
				Demo mailbox.
				<a class="font-semibold text-violet-600 underline" href="/api/auth/google?next=/stream">Connect Gmail</a>
			</p>
		{/if}
		{#if syncError}
			<p class="mt-2 text-[12px] text-rose-600">{syncError}</p>
		{/if}
	</div>

	<div class="relative z-10 mt-3 flex gap-2 px-5 pb-3">
		<div class="glass flex rounded-full p-1 ring-1 ring-black/[0.06]">
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
	</div>

	<div class="no-scrollbar relative flex-1 overflow-y-auto px-5 pb-28">
		<div class="pointer-events-none absolute top-0 bottom-8 left-[26px] w-px bg-gradient-to-b from-violet-200 via-neutral-200 to-transparent"></div>

		<!-- Needs Action -->
		<div class="relative pt-2 pb-1">
			<div class="mb-1 flex items-center gap-2 pl-[3px]">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-rose-500"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.action.label}</h2>
				<span class="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-600">{actionPending.length}</span>
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.action.hint}. Mark ✓ done and it disappears.</p>

			<div class="flex flex-col gap-3 pl-8">
				{#each actionPending as thread (thread.id)}
					<StreamBubble {thread} />
				{/each}
				{#if actionPending.length === 0}
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400">All handled — nothing waiting on you 🎉</p>
				{/if}

				{#if actionDone.length > 0}
					<button
						type="button"
						onclick={() => (showDone = !showDone)}
						class="tap-scale flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50/70 py-2.5 text-[12px] font-semibold text-emerald-600 ring-1 ring-emerald-100"
					>
						<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
							<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						{actionDone.length} done — {showDone ? 'hide' : 'show'}
					</button>
					{#if showDone}
						{#each actionDone as t (t.id)}
							<div class="flex items-center gap-2.5 rounded-2xl bg-white/40 px-4 py-3 opacity-70">
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
					{/if}
				{/if}
			</div>
		</div>

		<!-- Orders & Deliveries -->
		<div class="relative pt-6 pb-1">
			<div class="mb-1 flex items-center gap-2 pl-[3px]">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-amber-500"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.orders.label}</h2>
				<span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">{orders.length}</span>
				<span class="text-[11px] text-neutral-400">· last 30 days</span>
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.orders.hint}.</p>

			<div class="flex flex-col gap-3 pl-8">
				{#each merchantGroups as [merchant, items] (merchant)}
					<OrderMerchantGroup {merchant} {items} />
				{/each}
				{#if merchantGroups.length === 0}
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400">
						{filter === 'unread' ? 'No unread order mail. Switch to “All mail” to browse past orders.' : 'No order mail in the last 30 days.'}
					</p>
				{/if}
			</div>
		</div>

		<!-- Catch Up -->
		<div class="relative pt-6 pb-1">
			<div class="mb-1 flex items-center gap-2 pl-[3px]">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-violet-500"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.catchup.label}</h2>
				<span class="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-600">{catchup.length}</span>
				<span class="flex-1"></span>
				{#if catchupUnread > 0}
					<button
						type="button"
						onclick={() => markGroupRead('catchup')}
						class="tap-scale rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-violet-600 shadow-glass ring-1 ring-black/[0.05]"
					>
						Mark all read
					</button>
				{/if}
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.catchup.hint}.</p>

			<div class="flex flex-col gap-3 pl-8">
				{#each catchup.slice(0, catchupLimit) as thread (thread.id)}
					<StreamBubble {thread} />
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
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400">You're all caught up.</p>
				{/if}
			</div>
		</div>

		<!-- Everything Else -->
		<div class="relative pt-6 pb-1">
			<div class="mb-1 flex items-center gap-2 pl-[3px]">
				<span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-paper ring-2 ring-white">
					<span class="h-2 w-2 rounded-full bg-slate-300"></span>
				</span>
				<h2 class="text-sm font-semibold text-ink">{groupMeta.other.label}</h2>
				<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">{other.length}</span>
			</div>
			<p class="mb-3 pl-8 text-[11.5px] text-neutral-400">{groupMeta.other.hint}.</p>

			<div class="flex flex-col gap-1 pl-8">
				{#each other.slice(0, otherLimit) as t (t.id)}
					<button
						type="button"
						onclick={() => goto(`/stream/${encodeURIComponent(t.id)}`)}
						class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left {t.unread ? 'bg-white/70' : 'opacity-50'}"
					>
						{#if t.unread}
							<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"></span>
						{:else}
							<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-200"></span>
						{/if}
						<span class="min-w-0 flex-1 truncate text-[12.5px] {t.unread ? 'font-medium text-ink' : 'text-neutral-500'}">
							<span class="font-semibold">{t.sender}</span> — {t.subject}
						</span>
						<span class="shrink-0 text-[10.5px] text-neutral-400">{t.timestamp}</span>
					</button>
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
					<p class="rounded-2xl bg-white/50 p-4 text-center text-[13px] text-neutral-400">Nothing else — quiet day.</p>
				{/if}
			</div>
		</div>
	</div>
</div>
