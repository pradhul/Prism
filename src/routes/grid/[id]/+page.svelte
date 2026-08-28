<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getThread, markRead } from '$lib/state/inbox.svelte';
	import { categories } from '$lib/data/categories';

	const thread = $derived(getThread(page.params.id ?? ''));

	$effect(() => {
		if (thread?.unread) markRead(thread.id);
	});

	const actions = [
		{ label: 'Reply', icon: 'reply' },
		{ label: 'Snooze', icon: 'clock' },
		{ label: 'Archive', icon: 'archive' }
	];
</script>

<svelte:head>
	<title>{thread ? thread.subject : 'Prism — Grid'}</title>
</svelte:head>

{#if !thread}
	<div class="flex h-dvh flex-col items-center justify-center gap-3 bg-neutral-50 px-6 text-center">
		<p class="text-sm font-medium text-neutral-400">That card isn't on the board anymore.</p>
		<button type="button" class="tap-scale rounded-full bg-ink px-4 py-2 text-sm font-bold text-white" onclick={() => goto('/grid')}>
			Back to Grid
		</button>
	</div>
{:else}
	{@const cat = categories[thread.category]}
	<div class="flex h-dvh w-full flex-col bg-neutral-50">
		<div class="no-scrollbar flex-1 overflow-y-auto pb-28">
			<header class="safe-top flex items-center justify-between px-5 pt-5">
				<button
					type="button"
					onclick={() => goto('/grid')}
					aria-label="Back"
					class="tap-scale flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-white"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
						<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</button>
				{#if thread.priority === 'urgent'}
					<span class="rounded-full bg-ink px-3 py-1.5 text-[10px] font-bold tracking-wide text-lime-300 uppercase">
						AI flagged · Urgent
					</span>
				{/if}
			</header>

			<div class="px-5 pt-6">
				<div class="mb-3 flex items-center gap-1.5">
					<span class="h-2 w-2 rounded-full" style={`background:${cat.accent}`}></span>
					<span class="text-xs font-bold tracking-wide text-neutral-500 uppercase">{cat.label}</span>
					<span class="text-xs text-neutral-400">· {thread.timestamp}</span>
				</div>

				<h1 class="text-[28px] leading-[1.12] font-bold tracking-tight text-ink">{thread.subject}</h1>

				<div class="mt-4 flex items-center gap-2.5">
					<span class="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-white">
						{thread.senderInitials}
					</span>
					<span class="text-sm font-semibold text-ink">{thread.sender}</span>
				</div>

				<div class="mt-6 rounded-[22px] border-2 border-ink bg-white p-4">
					<div class="mb-2 flex items-center gap-1.5">
						<svg viewBox="0 0 24 24" class="h-4 w-4 text-ink" fill="currentColor">
							<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
						</svg>
						<span class="text-[11px] font-bold tracking-wide text-neutral-500 uppercase">AI takeaway</span>
					</div>
					<p class="text-[17px] leading-snug font-semibold text-ink italic">"{thread.gist}"</p>
					<div class="mt-3 flex flex-col gap-1.5 border-t border-dashed border-neutral-200 pt-3">
						{#each thread.summary as line (line)}
							<div class="flex items-start gap-2">
								<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400"></span>
								<p class="text-[13px] leading-relaxed text-neutral-600">{line}</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-6 flex flex-col gap-3">
					{#each thread.messages as msg (msg.id)}
						<div class="rounded-[22px] bg-white p-4 ring-1 ring-neutral-200">
							<div class="flex items-center justify-between">
								<span class="text-[13px] font-bold text-ink">{msg.sender}</span>
								<span class="text-[11px] text-neutral-400">{msg.time}</span>
							</div>
							<div class="mt-2 flex flex-col gap-2">
								{#each msg.body as para (para)}
									<p class="text-[13.5px] leading-relaxed whitespace-pre-line text-neutral-600">{para}</p>
								{/each}
							</div>
							{#if msg.attachment}
								<div class="mt-3 flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5">
									<span class="text-[12px] font-medium text-ink">📎 {msg.attachment.name}</span>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="safe-bottom fixed inset-x-0 bottom-0 flex gap-2.5 bg-neutral-50/95 px-5 py-4 backdrop-blur">
			{#each actions as a (a.label)}
				<button
					type="button"
					class="tap-scale flex-1 rounded-2xl border-2 border-ink py-3 text-[13px] font-bold text-ink uppercase {a.label ===
					'Reply'
						? 'bg-ink text-white'
						: 'bg-white'}"
				>
					{a.label}
				</button>
			{/each}
		</div>
	</div>
{/if}
