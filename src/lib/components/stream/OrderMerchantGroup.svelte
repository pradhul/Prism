<script lang="ts">
	import type { Thread } from '$lib/types';
	import { clearMerchant, deleteThread } from '$lib/state/inbox.svelte';
	import { senderIcon } from '$lib/data/senderIcons';
	import { goto } from '$app/navigation';

	let { merchant, items }: { merchant: string; items: Thread[] } = $props();
	const icon = $derived(senderIcon(merchant));

	let showAll = $state(false);
	const visible = $derived(showAll ? items : items.slice(0, 3));
	const unread = $derived(items.filter((t) => t.unread).length);
</script>

<div class="overflow-hidden rounded-[20px] bg-white/70 ring-1 ring-black/[0.04]">
	<div class="flex items-center gap-2 px-4 py-3">
		{#if icon}
			<span class="flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-black/[0.08]" style="background: {icon.bg}">
				<svg viewBox="0 0 24 24" class="h-4 w-4" role="img" aria-label={icon.title}>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, hand-authored brand SVG data -->
					{@html icon.svg}
				</svg>
			</span>
		{:else}
			<span class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
				{merchant.slice(0, 2).toUpperCase()}
			</span>
		{/if}
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
			<div class="flex items-center gap-1 px-2 py-1 {t.unread ? '' : 'opacity-50'}">
				<button
					type="button"
					onclick={() => goto(`/stream/${encodeURIComponent(t.id)}`)}
					class="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5 text-left"
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
				<button
					type="button"
					onclick={() => deleteThread(t.id)}
					aria-label={`Delete ${t.subject}`}
					class="tap-scale mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
				>
					<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
						<path
							d="M4 7h16M10 11v6m4-6v6M6 7l1 13a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9L18 7M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
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
