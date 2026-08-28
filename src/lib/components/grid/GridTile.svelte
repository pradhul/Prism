<script lang="ts">
	import type { Thread } from '$lib/types';
	import { categories } from '$lib/data/categories';
	import { goto } from '$app/navigation';

	let { thread, wide = false }: { thread: Thread; wide?: boolean } = $props();
	const cat = $derived(categories[thread.category]);
</script>

<button
	type="button"
	onclick={() => goto(`/grid/${thread.id}`)}
	class="tap-scale relative flex flex-col justify-between overflow-hidden rounded-[22px] p-4 text-left {wide
		? 'col-span-2'
		: ''} {thread.unread ? 'border-2 border-ink bg-white' : 'border-2 border-neutral-200 bg-neutral-100/60'}"
>
	{#if thread.unread}
		<span class="absolute top-3 right-3 rounded-full bg-lime-300 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-ink uppercase">
			New
		</span>
	{/if}
	<div class="flex items-center gap-1.5">
		<span class="h-1.5 w-1.5 rounded-full" style={`background:${cat.accent}`}></span>
		<span class="text-[10px] font-bold tracking-wide text-neutral-500 uppercase">{cat.label}</span>
		{#if thread.group === 'action' && !thread.done}
			<span class="text-[9px] font-bold tracking-wide text-rose-500 uppercase">· Pending</span>
		{/if}
	</div>

	<h3 class="mt-2 line-clamp-2 pr-6 text-[15px] leading-snug font-semibold {thread.unread ? 'text-ink' : 'text-neutral-400'}">
		{thread.subject}
	</h3>

	{#if wide}
		<p class="mt-1.5 line-clamp-2 text-[12.5px] leading-snug {thread.unread ? 'text-neutral-500' : 'text-neutral-400'}">
			{thread.gist}
		</p>
	{/if}

	<div class="mt-3 flex items-center gap-1.5">
		<span class="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-bold text-neutral-600">
			{thread.senderInitials}
		</span>
		<span class="truncate text-[11px] text-neutral-400">{thread.sender}</span>
		<span class="ml-auto shrink-0 text-[11px] text-neutral-400">{thread.timestamp}</span>
	</div>
</button>
