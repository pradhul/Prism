<script lang="ts">
	import type { Thread } from '$lib/types';
	import { categories } from '$lib/data/categories';
	import { senderIcon } from '$lib/data/senderIcons';
	import { goto } from '$app/navigation';

	let { thread }: { thread: Thread } = $props();
	const cat = $derived(categories[thread.category]);
	const icon = $derived(senderIcon(thread.sender));
</script>

<button
	type="button"
	onclick={() => goto(`/grid/${thread.id}`)}
	class="tap-scale relative flex w-full flex-col justify-between overflow-hidden rounded-[26px] bg-ink p-5 text-left text-white"
>
	<div class="flex items-center justify-between">
		<span class="rounded-full bg-lime-300 px-2.5 py-1 text-[10px] font-bold tracking-wide text-ink uppercase">
			{thread.priority === 'urgent' ? 'Urgent · AI flagged' : 'Top priority'}
		</span>
		<span class="text-[11px] text-white/50">{thread.timestamp}</span>
	</div>

	<h2 class="mt-6 text-[26px] leading-[1.12] font-semibold tracking-tight">{thread.subject}</h2>

	<div class="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 p-3">
		<svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-lime-300" fill="currentColor">
			<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
		</svg>
		<p class="line-clamp-2 text-[13px] leading-snug text-white/80">{thread.gist}</p>
	</div>

	<div class="mt-4 flex items-center justify-between">
		<div class="flex items-center gap-2">
			{#if icon}
				<span class="flex h-7 w-7 items-center justify-center rounded-full" style="background: {icon.bg}">
					<svg viewBox="0 0 24 24" class="h-4 w-4" role="img" aria-label={icon.title}>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, hand-authored brand SVG data -->
						{@html icon.svg}
					</svg>
				</span>
			{:else}
				<span class="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold">
					{thread.senderInitials}
				</span>
			{/if}
			<span class="text-[13px] font-medium text-white/85">{thread.sender}</span>
		</div>
		<span class="rounded-full border border-white/25 px-2.5 py-1 text-[11px] font-medium">{cat.label}</span>
	</div>
</button>
