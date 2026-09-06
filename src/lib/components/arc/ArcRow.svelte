<script lang="ts">
	import type { Thread } from '$lib/types';
	import { categories } from '$lib/data/categories';
	import Avatar from '$lib/components/shared/Avatar.svelte';
	import { goto } from '$app/navigation';

	let {
		thread,
		variant = 'feature'
	}: { thread: Thread; variant?: 'hero' | 'compact' | 'feature' | 'minimal' } = $props();

	const cat = $derived(categories[thread.category]);
</script>

<button
	type="button"
	onclick={() => goto(`/arc/${thread.id}`)}
	class="tap-scale block w-full text-left {thread.unread ? '' : 'opacity-60'}"
>
	<div class="mb-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
		<span class="text-[10.5px] font-semibold tracking-[0.08em] text-neutral-500 uppercase">
			{cat.label} · {thread.timestamp}
		</span>
		<span class="ml-auto flex items-center gap-1">
			{#if thread.unread}
				<span
					class="rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-white uppercase"
					style={`background:${cat.accent}`}
				>
					Unread
				</span>
			{:else}
				<span class="rounded-[4px] bg-neutral-200/80 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-neutral-500 uppercase">
					Read
				</span>
			{/if}
			{#if thread.risk}
				<span class="rounded-[4px] bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-white uppercase">
					⚠ Suspicious
				</span>
			{:else if thread.group === 'action' && !thread.done}
				<span class="rounded-[4px] border border-ink/60 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-ink uppercase">
					Reply needed
				</span>
			{/if}
			{#if thread.group === 'orders' && thread.merchant}
				<span class="rounded-[4px] border border-neutral-300 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.06em] text-neutral-500 uppercase">
					Order · {thread.merchant}
				</span>
			{/if}
		</span>
	</div>

	<h3
		class="font-serif {thread.unread ? 'text-ink' : 'text-neutral-500'} {variant === 'hero'
			? 'text-[26px] leading-[1.12] font-semibold'
			: variant === 'feature'
				? 'text-[19px] leading-snug font-semibold'
				: 'text-[15px] leading-snug font-semibold'}"
	>
		{thread.subject}
	</h3>

	{#if variant === 'hero' || variant === 'feature'}
		<p class="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-neutral-500">{thread.gist}</p>
		<div class="mt-2.5 flex items-center gap-2">
			<Avatar initials={thread.senderInitials} sender={thread.sender} classes={thread.avatar} size="sm" />
			<span class="text-[12.5px] font-medium text-neutral-600">{thread.sender}</span>
		</div>
	{:else}
		<p class="mt-1 text-[12px] text-neutral-400">{thread.sender}</p>
	{/if}
</button>
