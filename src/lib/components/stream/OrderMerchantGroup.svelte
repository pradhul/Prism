<script lang="ts">
	import type { Thread } from '$lib/types';
	import { clearMerchant } from '$lib/state/inbox.svelte';
	import { goto } from '$app/navigation';

	let { merchant, items }: { merchant: string; items: Thread[] } = $props();

	let showAll = $state(false);
	const visible = $derived(showAll ? items : items.slice(0, 3));
	const unread = $derived(items.filter((t) => t.unread).length);
</script>

<div class="overflow-hidden rounded-[20px] bg-white/70 ring-1 ring-black/[0.04]">
	<div class="flex items-center gap-2 px-4 py-3">
		<span class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
			{merchant.slice(0, 2).toUpperCase()}
		</span>
		<div class="min-w-0 flex-1">
			<p class="text-[13px] font-semibold text-ink">{merchant}</p>
			<p class="text-[11px] text-neutral-400">
				{items.length}
				{items.length === 1 ? 'mail' : 'mails'}{unread ? ` · ${unread} new` : ''}
			</p>
		</div>
		<button
			type="button"
			onclick={() => clearMerchant(merchant)}
			class="tap-scale rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] font-semibold text-neutral-600"
		>
			Clear all
		</button>
	</div>

	<div class="flex flex-col divide-y divide-black/[0.03]">
		{#each visible as t (t.id)}
			<button
				type="button"
				onclick={() => goto(`/stream/${t.id}`)}
				class="flex items-center gap-2.5 px-4 py-2.5 text-left {t.unread ? '' : 'opacity-50'}"
			>
				{#if t.unread}
					<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"></span>
				{:else}
					<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-200"></span>
				{/if}
				<p class="min-w-0 flex-1 truncate text-[12.5px] {t.unread ? 'font-medium text-ink' : 'text-neutral-500'}">
					{t.subject}
				</p>
				<span class="shrink-0 text-[10.5px] text-neutral-400">{t.timestamp}</span>
			</button>
		{/each}
	</div>

	{#if items.length > 3}
		<button
			type="button"
			onclick={() => (showAll = !showAll)}
			class="w-full border-t border-black/[0.03] py-2.5 text-center text-[11.5px] font-semibold text-violet-500"
		>
			{showAll ? 'Show less' : `Show ${items.length - 3} more`}
		</button>
	{/if}
</div>
