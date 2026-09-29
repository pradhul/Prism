<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut, expoOut } from 'svelte/easing';
	import { search, searchScopes, searchSuggestions, runSearch, setSearchScope } from '$lib/state/search.svelte';
	import Avatar from '$lib/components/shared/Avatar.svelte';
	import { categories } from '$lib/data/categories';

	let {
		onOpenThread,
		autofocus = false
	}: {
		onOpenThread: (id: string) => void;
		autofocus?: boolean;
	} = $props();

	let input = $state<HTMLInputElement | null>(null);

	onMount(() => {
		if (autofocus && !search.searched) input?.focus();
	});

	const scopeLabel = $derived(searchScopes.find((s) => s.days === search.scopeDays)?.label.toLowerCase() ?? '');
</script>

<div class="flex min-h-0 flex-1 flex-col">
	<div class="px-5 pt-1">
		<form
			onsubmit={(e) => {
				e.preventDefault();
				runSearch();
			}}
			class="rise flex items-center gap-2 rounded-[20px] bg-white py-2 pr-1.5 pl-4 shadow-glass ring-1 ring-black/[0.06] transition-shadow focus-within:ring-violet-300"
		>
			<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-violet-500" fill="currentColor">
				<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
			</svg>
			<input
				bind:this={input}
				bind:value={search.query}
				placeholder="“that pdf about the Q3 timeline...”"
				class="min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-neutral-400 focus:outline-none"
			/>
			<button
				type="submit"
				aria-label="Search"
				class="tap-scale tap-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
					<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
					<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
				</svg>
			</button>
		</form>

		<div class="rise mt-3 flex items-center gap-2" style="--rise-delay: 60ms">
			<span class="text-[11px] font-medium text-neutral-400">Looking back:</span>
			{#each searchScopes as s (s.days)}
				<button
					type="button"
					onclick={() => setSearchScope(s.days)}
					class="tap-scale rounded-full px-2.5 py-1 text-[11px] font-semibold {search.scopeDays === s.days
						? 'bg-ink text-white'
						: 'bg-white text-neutral-500 ring-1 ring-black/[0.06]'}"
				>
					{s.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="no-scrollbar flex-1 overflow-y-auto px-5 pt-4 pb-10">
		{#if !search.searched}
			<div in:fade={{ duration: 200 }}>
				<p class="mb-2.5 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">Try asking for</p>
				<div class="flex flex-col gap-2">
					{#each searchSuggestions as s, i (s)}
						<button
							type="button"
							onclick={() => runSearch(s)}
							class="rise tap-scale flex items-center gap-2.5 rounded-2xl bg-white/70 px-4 py-3 text-left text-[13.5px] text-neutral-600 ring-1 ring-black/[0.04]"
							style="--rise-delay: {100 + i * 50}ms"
						>
							<svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none">
								<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8" />
								<path d="M16 16l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
							</svg>
							“{s}”
						</button>
					{/each}
				</div>
			</div>
		{:else}
			{#if search.interpretation}
				{@const interpretation = search.interpretation}
				<div class="mb-4 rounded-2xl bg-violet-50/80 p-3.5 ring-1 ring-violet-100" in:fly={{ y: 10, duration: 300, easing: expoOut }}>
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
						{#each interpretation.keywords.filter((k) => !interpretation.people.some((p) => p.toLowerCase().includes(k)) && !interpretation.stores.some((s) => s.toLowerCase().includes(k))) as k (k)}
							<span class="rounded-full bg-white px-2.5 py-1 text-[11px] text-neutral-500 ring-1 ring-violet-100">“{k}”</span>
						{/each}
						<span class="rounded-full bg-white px-2.5 py-1 text-[11px] text-neutral-500 ring-1 ring-violet-100">🗓 {scopeLabel}</span>
					</div>
				</div>
			{/if}

			<p class="mb-2.5 text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
				{search.hits.length === 0 ? 'No matches' : `${search.hits.length} ${search.hits.length === 25 ? 'best ' : ''}matches`}
			</p>

			{#if search.hits.length === 0}
				<div class="rounded-2xl bg-white/60 p-5 text-center" in:fade={{ duration: 200 }}>
					<p class="text-[13.5px] text-neutral-500">
						Nothing in the {scopeLabel}. Try widening the time range or using different words.
					</p>
				</div>
			{:else}
				<div class="flex flex-col gap-2.5">
					{#each search.hits as hit, i (hit.thread.id)}
						<button
							type="button"
							onclick={() => onOpenThread(hit.thread.id)}
							class="tap-scale rounded-2xl bg-white p-3.5 text-left shadow-glass ring-1 ring-black/[0.04] {hit.thread.unread
								? ''
								: 'opacity-75'}"
							in:fly={{ y: 16, duration: 360, delay: Math.min(i, 8) * 40, easing: expoOut }}
							out:fade={{ duration: 120 }}
							animate:flip={{ duration: 260, easing: cubicOut }}
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
