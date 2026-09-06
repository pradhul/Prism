<script lang="ts">
	import type { Thread } from '$lib/types';
	import Avatar from '$lib/components/shared/Avatar.svelte';
	import { markDone } from '$lib/state/inbox.svelte';
	import { effectiveTags, tagMeta } from '$lib/state/organize.svelte';
	import { goto } from '$app/navigation';

	let { thread }: { thread: Thread } = $props();
	let expanded = $state(false);

	const tags = $derived(effectiveTags(thread));

	function open() {
		goto(`/stream/${thread.id}`);
	}

	function toggle(e: Event) {
		e.stopPropagation();
		expanded = !expanded;
	}

	function done(e: Event) {
		e.stopPropagation();
		markDone(thread.id);
	}
</script>

<div
	role="button"
	tabindex="0"
	onclick={open}
	onkeydown={(e) => e.key === 'Enter' && open()}
	class="tap-scale relative w-full cursor-pointer rounded-[22px] p-4 text-left {thread.risk
		? 'bg-rose-50/70 ring-1 ring-rose-200'
		: thread.unread
			? 'glass shadow-glass ring-1 ring-black/[0.04]'
			: 'bg-white/45 ring-1 ring-black/[0.04]'}"
>
	<div class="flex items-center gap-2.5 {thread.unread ? '' : 'opacity-55'}">
		<Avatar initials={thread.senderInitials} sender={thread.sender} classes={thread.avatar} size="sm" />
		<div class="min-w-0 flex-1">
			<p class="truncate text-[13px] font-semibold text-ink">{thread.sender}</p>
		</div>
		{#if thread.unread}
			<span class="flex shrink-0 items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-600">
				<span class="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
				New
			</span>
		{:else}
			<span class="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-400">Read</span>
		{/if}
		{#each tags.slice(0, 2) as tag (tag)}
			<span class="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 {tagMeta(tag).pill}">
				<svg viewBox="0 0 24 24" class="h-2.5 w-2.5" fill="none">
					<path
						d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"
						stroke="currentColor"
						stroke-width="2.4"
						stroke-linejoin="round"
					/>
				</svg>
				{tag}
			</span>
		{/each}
		{#if tags.length > 2}
			<span class="shrink-0 text-[10px] font-semibold text-neutral-400">+{tags.length - 2}</span>
		{/if}
		<span class="shrink-0 text-[11px] text-neutral-400">{thread.timestamp}</span>
	</div>

	<p class="mt-2.5 text-[15px] leading-snug font-semibold {thread.unread ? 'text-ink' : 'text-neutral-500'}">
		{thread.subject}
	</p>

	<div class="mt-1.5 flex gap-1.5 {thread.unread ? '' : 'opacity-60'}">
		<svg viewBox="0 0 24 24" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" fill="currentColor">
			<path
				d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z"
			/>
		</svg>
		<p class="line-clamp-2 text-[13px] leading-relaxed text-neutral-500 italic">{thread.gist}</p>
	</div>

	{#if expanded}
		<div class="mt-3 flex flex-col gap-1.5 rounded-2xl bg-white/70 p-3 ring-1 ring-black/[0.03]">
			{#each thread.summary as line (line)}
				<div class="flex items-start gap-2">
					<span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400"></span>
					<p class="text-[12.5px] leading-relaxed text-neutral-600">{line}</p>
				</div>
			{/each}
		</div>
	{/if}

	<div class="mt-3 flex items-center gap-1.5">
		{#if thread.risk}
			<span class="flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white">
				⚠ Suspicious
			</span>
		{:else if thread.group === 'action'}
			<span class="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-500 ring-1 ring-rose-100">
				{thread.daysAgo === 0 ? 'waiting since today' : `waiting ${thread.daysAgo}d`}
			</span>
		{:else if thread.group === 'catchup' && thread.readMin}
			<span class="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
				~{thread.readMin} min read
			</span>
		{/if}

		<span class="flex-1"></span>

		{#if thread.group === 'action'}
			<button
				type="button"
				onclick={done}
				aria-label="Mark as done"
				class="tap-scale flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-100"
			>
				<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
					<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				Done
			</button>
		{/if}

		<button
			type="button"
			onclick={toggle}
			aria-label={expanded ? 'Collapse summary' : 'Expand summary'}
			class="tap-scale flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-neutral-500 ring-1 ring-black/[0.04]"
		>
			<svg
				viewBox="0 0 24 24"
				class="h-3.5 w-3.5 transition-transform duration-200 {expanded ? 'rotate-180' : ''}"
				fill="none"
			>
				<path
					d="M6 9l6 6 6-6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</div>
</div>
