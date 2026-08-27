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

<button type="button" onclick={() => goto(`/arc/${thread.id}`)} class="tap-scale block w-full text-left">
	<div class="mb-1.5 flex items-center gap-1.5">
		<span class="text-[10.5px] font-semibold tracking-[0.08em] text-neutral-500 uppercase">
			{cat.label} · {thread.timestamp}
		</span>
		{#if thread.unread}
			<span class="ml-auto h-2 w-2 shrink-0 rounded-sm" style={`background:${cat.accent}`}></span>
		{/if}
	</div>

	<h3
		class="font-serif text-ink {variant === 'hero'
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
			<Avatar initials={thread.senderInitials} classes={thread.avatar} size="sm" />
			<span class="text-[12.5px] font-medium text-neutral-600">{thread.sender}</span>
		</div>
	{:else}
		<p class="mt-1 text-[12px] text-neutral-400">{thread.sender}</p>
	{/if}
</button>
