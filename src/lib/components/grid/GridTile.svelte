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
	class="tap-scale relative flex flex-col justify-between overflow-hidden rounded-[22px] border-2 border-ink bg-white p-4 text-left {wide
		? 'col-span-2'
		: ''}"
>
	{#if thread.unread}
		<span class="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-lime-400 ring-2 ring-white"></span>
	{/if}
	<div class="flex items-center gap-1.5">
		<span class="h-1.5 w-1.5 rounded-full" style={`background:${cat.accent}`}></span>
		<span class="text-[10px] font-bold tracking-wide text-neutral-500 uppercase">{cat.label}</span>
	</div>

	<h3 class="mt-2 line-clamp-2 text-[15px] leading-snug font-semibold text-ink">{thread.subject}</h3>

	{#if wide}
		<p class="mt-1.5 line-clamp-2 text-[12.5px] leading-snug text-neutral-500">{thread.gist}</p>
	{/if}

	<div class="mt-3 flex items-center gap-1.5">
		<span class="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-bold text-neutral-600">
			{thread.senderInitials}
		</span>
		<span class="truncate text-[11px] text-neutral-400">{thread.sender}</span>
		<span class="ml-auto shrink-0 text-[11px] text-neutral-400">{thread.timestamp}</span>
	</div>
</button>
