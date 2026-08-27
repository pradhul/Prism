<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getThread, threads } from '$lib/data/emails';
	import { categories } from '$lib/data/categories';
	import Avatar from '$lib/components/shared/Avatar.svelte';
	import ArcBottomNav from '$lib/components/arc/ArcBottomNav.svelte';
	import type { CategoryKey } from '$lib/types';

	const thread = $derived(getThread(page.params.id ?? ''));

	let filter = $state<CategoryKey | 'all'>('all');
	let gistOpen = $state(false);
	let touchStartX = 0;
	let touchStartY = 0;

	$effect(() => {
		if (thread) filter = thread.category;
	});

	const feed = $derived(filter === 'all' ? threads : threads.filter((t) => t.category === filter));
	const index = $derived(thread ? feed.findIndex((t) => t.id === thread.id) : -1);

	function go(delta: number) {
		if (index === -1) return;
		const next = feed[(index + delta + feed.length) % feed.length];
		gistOpen = false;
		goto(`/arc/${next.id}`);
	}

	function selectCategory(key: CategoryKey | 'all') {
		filter = key;
		const list = key === 'all' ? threads : threads.filter((t) => t.category === key);
		if (list.length) goto(`/arc/${list[0].id}`);
	}

	function onTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}
	function onTouchEnd(e: TouchEvent) {
		const dx = e.changedTouches[0].clientX - touchStartX;
		const dy = e.changedTouches[0].clientY - touchStartY;
		if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
			go(dx < 0 ? 1 : -1);
		}
	}
</script>

<svelte:head>
	<title>{thread ? thread.subject : 'Prism — The Brief'}</title>
</svelte:head>

{#if !thread}
	<div class="flex h-dvh flex-col items-center justify-center gap-3 bg-[#fbf9f4] px-6 text-center font-editorial">
		<p class="text-sm text-neutral-500">This one's not in The Brief.</p>
		<button type="button" class="tap-scale rounded-full bg-ink px-4 py-2 text-sm font-medium text-white" onclick={() => goto('/arc')}>
			Back to The Brief
		</button>
	</div>
{:else}
	{@const cat = categories[thread.category]}
	<div
		class="relative flex h-dvh w-full flex-col bg-[#fbf9f4] font-editorial"
		role="presentation"
		ontouchstart={onTouchStart}
		ontouchend={onTouchEnd}
	>
		<header class="safe-top flex items-center justify-between px-5 pt-5 pb-2">
			<button type="button" onclick={() => goto('/arc')} aria-label="Back" class="tap-scale -m-2 p-2 text-ink/60">
				<svg viewBox="0 0 24 24" class="h-5 w-5" fill="none">
					<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
			<p class="text-[11px] font-medium tracking-[0.1em] text-neutral-400 uppercase">
				{cat.label} · {index + 1} of {feed.length}
			</p>
			<div class="w-5"></div>
		</header>

		<div class="no-scrollbar flex-1 overflow-y-auto px-6 pt-2 pb-32">
			<p class="text-[11px] font-semibold tracking-[0.12em] text-neutral-400 uppercase">
				{cat.label} · {thread.timestamp}
			</p>

			<h1 class="mt-2 font-serif text-[32px] leading-[1.14] font-semibold text-ink">{thread.subject}</h1>

			<div class="mt-4 flex items-center gap-2.5">
				<Avatar initials={thread.senderInitials} classes={thread.avatar} size="md" />
				<div>
					<p class="text-[13.5px] font-medium text-ink">{thread.sender}</p>
					<p class="text-[11.5px] text-neutral-400">{thread.timestamp}</p>
				</div>
			</div>

			<button
				type="button"
				onclick={() => (gistOpen = !gistOpen)}
				class="tap-scale mt-6 w-full rounded-2xl border border-ink/10 bg-white/60 p-4 text-left"
			>
				<div class="flex items-center gap-2">
					<svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-ink/60" fill="currentColor">
						<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
					</svg>
					<p class="text-[10.5px] font-semibold tracking-[0.1em] text-neutral-400 uppercase">Prism read this for you</p>
					<svg
						viewBox="0 0 24 24"
						class="ml-auto h-3.5 w-3.5 text-neutral-400 transition-transform {gistOpen ? 'rotate-180' : ''}"
						fill="none"
					>
						<path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<p class="mt-2 font-serif text-[16px] leading-snug text-ink italic">"{thread.gist}"</p>
				{#if gistOpen}
					<div class="mt-3 flex flex-col gap-2 border-t border-dashed border-ink/10 pt-3">
						{#each thread.summary as line (line)}
							<div class="flex items-start gap-2">
								<span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/40"></span>
								<p class="font-sans text-[12.5px] leading-relaxed text-neutral-600">{line}</p>
							</div>
						{/each}
					</div>
				{/if}
			</button>

			<div class="mt-7 flex flex-col gap-5">
				{#each thread.messages as msg (msg.id)}
					<div>
						{#if thread.messages.length > 1}
							<p class="mb-1.5 text-[11px] font-medium text-neutral-400">{msg.sender} · {msg.time}</p>
						{/if}
						{#each msg.body as para (para)}
							<p class="mb-3 text-[16.5px] leading-[1.7] text-ink/80">{para}</p>
						{/each}
						{#if msg.attachment}
							<div class="mt-1 flex w-fit items-center gap-2 rounded-full border border-ink/15 px-3.5 py-2">
								<svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-ink/50" fill="none">
									<path d="M8 4h6l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
								</svg>
								<span class="text-[12.5px] font-medium text-ink/70">{msg.attachment.name}</span>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<p class="mt-8 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
				<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
					<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Swipe for {index + 1 < feed.length ? 'next' : 'first'}
				<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
					<path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</p>
		</div>

		<ArcBottomNav active={filter} onSelect={selectCategory} />
	</div>
{/if}
