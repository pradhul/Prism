<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { searchMail, type SearchHit, type SearchInterpretation } from '$lib/state/inbox.svelte';
	import Avatar from '$lib/components/shared/Avatar.svelte';
	import { categories } from '$lib/data/categories';

	const from = $derived(
		['stream', 'grid', 'arc'].includes(page.url.searchParams.get('from') ?? '')
			? (page.url.searchParams.get('from') as string)
			: 'stream'
	);

	let query = $state('');
	let scopeDays = $state(30);
	let searched = $state(false);
	let hits = $state<SearchHit[]>([]);
	let interpretation = $state<SearchInterpretation | null>(null);

	const scopes = [
		{ days: 30, label: 'Past month' },
		{ days: 90, label: '3 months' },
		{ days: 3650, label: 'All time' }
	];

	const suggestions = [
		'the pdf marcus sent about the timeline',
		'amazon refund last month',
		'unread newsletters about design',
		'lease renewal from my landlord',
		'boarding pass'
	];

	function run(q?: string) {
		if (q !== undefined) query = q;
		if (!query.trim()) return;
		const res = searchMail(query, scopeDays);
		hits = res.hits;
		interpretation = res.interpretation;
		searched = true;
	}
</script>

<svelte:head>
	<title>Prism — AI Search</title>
</svelte:head>

<div class="flex h-dvh w-full flex-col bg-paper">
	<header class="safe-top flex items-center gap-3 px-5 pt-5 pb-2">
		<button
			type="button"
			onclick={() => goto(`/${from}`)}
			aria-label="Back"
			class="tap-scale flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-glass ring-1 ring-black/5"
		>
			<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
				<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		<div>
			<h1 class="text-[17px] font-semibold text-ink">Ask your inbox</h1>
			<p class="text-[11.5px] text-neutral-400">Describe it loosely — Prism figures out the rest</p>
		</div>
	</header>

	<div class="px-5 pt-2">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				run();
			}}
			class="flex items-center gap-2 rounded-[20px] bg-white py-2 pr-1.5 pl-4 shadow-glass ring-1 ring-black/[0.06]"
		>
			<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-violet-500" fill="currentColor">
				<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
			</svg>
			<input
				bind:value={query}
				placeholder="“that pdf about the Q3 timeline...”"
				class="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-neutral-400 focus:outline-none"
			/>
			<button
				type="submit"
				aria-label="Search"
				class="tap-scale flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
					<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
					<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
				</svg>
			</button>
		</form>

		<div class="mt-3 flex items-center gap-2">
			<span class="text-[11px] font-medium text-neutral-400">Looking back:</span>
			{#each scopes as s (s.days)}
				<button
					type="button"
					onclick={() => {
						scopeDays = s.days;
						if (searched) run();
					}}
					class="tap-scale rounded-full px-2.5 py-1 text-[11px] font-semibold {scopeDays === s.days
						? 'bg-ink text-white'
						: 'bg-white text-neutral-500 ring-1 ring-black/[0.06]'}"
				>
					{s.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-10">
		{#if !searched}
			<p class="mb-2.5 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">Try asking for</p>
			<div class="flex flex-col gap-2">
				{#each suggestions as s (s)}
					<button
						type="button"
						onclick={() => run(s)}
						class="tap-scale flex items-center gap-2.5 rounded-2xl bg-white/70 px-4 py-3 text-left text-[13.5px] text-neutral-600 ring-1 ring-black/[0.04]"
					>
						<svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none">
							<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
							<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
						</svg>
						“{s}”
					</button>
				{/each}
			</div>
		{:else}
			{#if interpretation}
				<div class="mb-4 rounded-2xl bg-violet-50/80 p-3.5 ring-1 ring-violet-100">
					<p class="text-[11px] font-semibold tracking-wide text-violet-500 uppercase">How Prism read that</p>
					<div class="mt-1.5 flex flex-wrap gap-1.5">
						{#each interpretation.people as p (p)}
							<span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-violet-100">👤 {p}</span>
						{/each}
						{#each interpretation.stores as s (s)}
							<span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-violet-100">🛍 {s}</span>
						{/each}
						{#if interpretation.wantsAttachment}
							<span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-violet-100">📎 has attachment</span>
						{/if}
						{#if interpretation.wantsUnread}
							<span class="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-ink ring-1 ring-violet-100">● unread only</span>
						{/if}
						{#each interpretation.keywords.filter((k) => !interpretation?.people.some((p) => p.toLowerCase().includes(k)) && !interpretation?.stores.some((s) => s.toLowerCase().includes(k))) as k (k)}
							<span class="rounded-full bg-white px-2.5 py-1 text-[11px] text-neutral-500 ring-1 ring-violet-100">“{k}”</span>
						{/each}
						<span class="rounded-full bg-white px-2.5 py-1 text-[11px] text-neutral-500 ring-1 ring-violet-100">
							🗓 {scopes.find((s) => s.days === scopeDays)?.label.toLowerCase()}
						</span>
					</div>
				</div>
			{/if}

			<p class="mb-2.5 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
				{hits.length === 0 ? 'No matches' : `${hits.length} ${hits.length === 25 ? 'best ' : ''}matches`}
			</p>

			{#if hits.length === 0}
				<div class="rounded-2xl bg-white/60 p-5 text-center">
					<p class="text-[13.5px] text-neutral-500">
						Nothing in the {scopes.find((s) => s.days === scopeDays)?.label.toLowerCase()}. Try widening the
						time range or using different words.
					</p>
				</div>
			{:else}
				<div class="flex flex-col gap-2.5">
					{#each hits as hit (hit.thread.id)}
						<button
							type="button"
							onclick={() => goto(`/${from}/${hit.thread.id}`)}
							class="tap-scale rounded-2xl bg-white p-3.5 text-left shadow-glass ring-1 ring-black/[0.04] {hit.thread.unread
								? ''
								: 'opacity-75'}"
						>
							<div class="flex items-center gap-2.5">
								<Avatar initials={hit.thread.senderInitials} sender={hit.thread.sender} classes={hit.thread.avatar} size="sm" />
								<div class="min-w-0 flex-1">
									<p class="truncate text-[13px] font-semibold text-ink">{hit.thread.sender}</p>
								</div>
								{#if hit.thread.unread}
									<span class="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-600">New</span>
								{/if}
								<span class="shrink-0 text-[11px] text-neutral-400">{hit.thread.timestamp}</span>
							</div>
							<p class="mt-1.5 line-clamp-1 text-[14px] font-semibold {hit.thread.unread ? 'text-ink' : 'text-neutral-500'}">
								{hit.thread.subject}
							</p>
							<div class="mt-2 flex flex-wrap gap-1.5">
								{#each hit.reasons as r (r)}
									<span class="rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-medium text-teal-600 ring-1 ring-teal-100">
										{r}
									</span>
								{/each}
								<span class="rounded-full px-2 py-0.5 text-[10.5px] font-medium ring-1 {categories[hit.thread.category].tint}">
									{categories[hit.thread.category].label}
								</span>
							</div>
						</button>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
