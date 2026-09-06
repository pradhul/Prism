<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getThread, markRead, markDone, deleteThread } from '$lib/state/inbox.svelte';
	import {
		effectiveTags,
		tagMeta,
		tagSource,
		tagStore,
		toggleThreadTag,
		createTag
	} from '$lib/state/organize.svelte';
	import { groupMeta } from '$lib/data/groups';
	import { categories } from '$lib/data/categories';
	import Avatar from '$lib/components/shared/Avatar.svelte';

	const thread = $derived(getThread(page.params.id ?? ''));
	const smartReplies = ['Got it, on it 👍', 'Can we get 24 more hours?', 'Approved — send it out'];

	let draft = $state('');
	let revealLink = $state(false);
	let tagSheet = $state(false);
	let newTag = $state('');

	function addNewTag() {
		if (!thread) return;
		const tag = createTag(newTag);
		if (tag) {
			toggleThreadTag(thread.id, tag.name);
			newTag = '';
		}
	}

	const linkHost = $derived(thread?.actionLink ? new URL(thread.actionLink.url).hostname : '');

	$effect(() => {
		if (thread?.unread) markRead(thread.id);
	});

	let leaving = $state(false);

	function back() {
		if (leaving) return;
		leaving = true;
		// history.back() is instant when we came from the stream; goto is the cold-start fallback
		if (history.length > 1) history.back();
		else goto('/stream');
	}

	function finish() {
		if (!thread) return;
		markDone(thread.id);
		back();
	}

	function remove() {
		if (!thread) return;
		deleteThread(thread.id);
		back();
	}
</script>

<svelte:head>
	<title>{thread ? thread.subject : 'Prism — Stream'}</title>
</svelte:head>

{#if !thread}
	<div class="flex h-dvh flex-col items-center justify-center gap-3 bg-paper px-6 text-center">
		<p class="text-sm text-neutral-500">That thread wandered off.</p>
		<button type="button" class="tap-scale rounded-full bg-ink px-4 py-2 text-sm font-medium text-white" onclick={() => goto('/stream')}>
			Back to Stream
		</button>
	</div>
{:else}
	{@const meta = groupMeta[thread.group]}
	{@const cat = categories[thread.category]}
	<div class="flex h-dvh w-full flex-col bg-paper">
		<header class="safe-top relative z-10 flex items-center justify-between px-4 pt-4 pb-3">
			<button
				type="button"
				onclick={back}
				aria-label="Back"
				class="tap-scale flex h-9 w-9 items-center justify-center rounded-full shadow-glass ring-1 ring-black/5 transition-colors duration-100 active:bg-ink active:text-white {leaving
					? 'bg-ink text-white'
					: 'bg-white'}"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
					<path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>

			<span
				class="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase ring-1 {cat.tint}"
			>
				<span class="h-1.5 w-1.5 rounded-full {meta.color.replace('text-', 'bg-')}"></span>
				{meta.label}
			</span>

			<div class="flex items-center gap-2">
				{#if thread.group === 'action' && !thread.done}
					<button
						type="button"
						onclick={finish}
						aria-label="Mark done"
						class="tap-scale flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-2 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-100"
					>
						<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
							<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						Done
					</button>
				{/if}
				<button
					type="button"
					onclick={remove}
					aria-label="Delete mail"
					class="tap-scale flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-400 shadow-glass ring-1 ring-black/5 transition-colors active:bg-rose-500 active:text-white"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
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
		</header>

		<div class="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
			<h1 class="px-1 pt-1 pb-2 text-[19px] font-semibold leading-snug text-ink">{thread.subject}</h1>

			<div class="flex flex-wrap items-center gap-1.5 px-1 pb-3">
				{#each effectiveTags(thread) as tag (tag)}
					<span class="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 {tagMeta(tag).pill}">
						<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none">
							<path
								d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z"
								stroke="currentColor"
								stroke-width="2.2"
								stroke-linejoin="round"
							/>
						</svg>
						{tag}
					</span>
				{/each}
				<button
					type="button"
					onclick={() => (tagSheet = true)}
					class="tap-scale flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] font-semibold text-neutral-500"
				>
					+ Tag
				</button>
			</div>

			<div class="relative overflow-hidden rounded-[22px] bg-white p-4 shadow-glass ring-1 ring-black/[0.04]">
				<div class="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-400 via-sky-400 to-rose-400"></div>
				<div class="mb-2.5 flex items-center gap-2">
					<svg viewBox="0 0 24 24" class="h-4 w-4 text-violet-500" fill="currentColor">
						<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
					</svg>
					<h2 class="text-sm font-semibold text-ink">Thread Summary</h2>
					<span class="ml-auto text-[10px] font-medium tracking-wide text-neutral-400 uppercase">AI generated</span>
				</div>
				<div class="flex flex-col gap-2">
					{#each thread.summary as line, i (line)}
						<div class="flex items-start gap-2">
							<span
								class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold {i === 0
									? 'bg-rose-100 text-rose-600'
									: 'bg-neutral-100 text-neutral-500'}"
							>
								{i + 1}
							</span>
							<p class="text-[13.5px] leading-relaxed text-ink/80">{line}</p>
						</div>
					{/each}
				</div>

				{#if thread.risk}
					<div class="mt-3 rounded-2xl bg-rose-50 p-3 ring-1 ring-rose-200">
						<p class="flex items-center gap-1.5 text-[12px] font-bold text-rose-600">
							<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
								<path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18.2A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
							Prism flagged this mail as suspicious
						</p>
						<ul class="mt-1.5 flex flex-col gap-1">
							{#each thread.risk.reasons as r (r)}
								<li class="flex items-start gap-1.5 text-[12px] leading-relaxed text-rose-700/90">
									<span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-rose-400"></span>
									{r}
								</li>
							{/each}
						</ul>
						{#if thread.actionLink}
							<div class="mt-2.5 rounded-xl bg-white/80 px-3 py-2">
								<p class="text-[11.5px] font-semibold text-rose-600">
									Link withheld — “{thread.actionLink.label}” points to {linkHost}
								</p>
								{#if revealLink}
									<p class="mt-1 text-[11px] break-all text-neutral-500">{thread.actionLink.url}</p>
								{:else}
									<button type="button" class="mt-0.5 text-[11px] font-medium text-neutral-400 underline" onclick={() => (revealLink = true)}>
										Show the address anyway
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{:else if thread.actionLink}
					<a
						href={thread.actionLink.url}
						target="_blank"
						rel="noopener noreferrer"
						class="tap-scale mt-3 flex items-center justify-center gap-1.5 rounded-full bg-violet-500 py-2.5 text-[13px] font-semibold text-white"
					>
						{thread.actionLink.label}
						<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
							<path d="M7 17 17 7m0 0H9m8 0v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</a>
					<p class="mt-1.5 text-center text-[10.5px] text-neutral-400">Link found in this mail · goes to {linkHost}</p>
				{/if}
			</div>

			<div class="mt-5 flex flex-col gap-3">
				{#each thread.messages as msg (msg.id)}
					<div
						class="rounded-[22px] bg-white p-4 shadow-glass ring-1 ring-black/[0.04] {msg.highlighted
							? 'border-l-[3px] border-rose-400 bg-rose-50/40'
							: ''}"
					>
						<div class="flex items-center gap-2.5">
							<Avatar initials={msg.senderInitials} sender={msg.sender} classes={thread.avatar} size="sm" />
							<div class="min-w-0 flex-1">
								<p class="truncate text-[13px] font-semibold text-ink">{msg.sender}</p>
								<p class="text-[11px] text-neutral-400">{msg.time}</p>
							</div>
						</div>
						<div class="mt-3 flex flex-col gap-2">
							{#each msg.body as para (para)}
								<p
									class="text-[13.5px] leading-relaxed whitespace-pre-line {msg.highlighted && para.includes('?')
										? 'font-medium text-rose-600'
										: 'text-ink/75'}"
								>
									{para}
								</p>
							{/each}
						</div>
						{#if msg.attachment}
							<div class="mt-3 flex items-center gap-2.5 rounded-2xl bg-neutral-50 p-2.5 ring-1 ring-black/[0.04]">
								<span class="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-500">
									<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
										<path
											d="M8 4h6l4 4v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
											stroke="currentColor"
											stroke-width="1.6"
											stroke-linejoin="round"
										/>
										<path d="M14 4v4h4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
									</svg>
								</span>
								<div class="min-w-0 flex-1">
									<p class="truncate text-[12.5px] font-medium text-ink">{msg.attachment.name}</p>
									<p class="text-[11px] text-neutral-400">{msg.attachment.size}</p>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="safe-bottom relative z-10 border-t border-black/[0.04] bg-paper/95 px-4 pt-3 backdrop-blur">
			<div class="no-scrollbar mb-2.5 flex gap-2 overflow-x-auto">
				{#each smartReplies as reply (reply)}
					<button
						type="button"
						onclick={() => (draft = reply)}
						class="tap-scale glass shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium text-ink ring-1 ring-black/[0.05]"
					>
						{reply}
					</button>
				{/each}
			</div>
			<div class="mb-3 flex items-center gap-2 rounded-full bg-white py-2 pl-4 pr-1.5 shadow-glass ring-1 ring-black/[0.05]">
				<input
					bind:value={draft}
					placeholder="Draft a quick reply..."
					class="flex-1 bg-transparent text-[14px] text-ink placeholder:text-neutral-400 focus:outline-none"
				/>
				<button
					type="button"
					aria-label="Send"
					class="tap-scale flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white"
				>
					<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none">
						<path d="M4 12l16-7-6 16-2-7-8-2z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" fill="currentColor" />
					</svg>
				</button>
			</div>
		</div>

		{#if tagSheet}
			<div class="fixed inset-0 z-50 flex flex-col justify-end">
				<button type="button" aria-label="Close tags" class="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onclick={() => (tagSheet = false)}></button>
				<div class="safe-bottom relative rounded-t-[26px] bg-white px-5 pt-4 pb-6 shadow-glass-lg">
					<div class="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200"></div>
					<div class="mb-1 flex items-center justify-between">
						<h3 class="text-[15px] font-semibold text-ink">Tags for this mail</h3>
						<button type="button" onclick={() => (tagSheet = false)} class="tap-scale text-[13px] font-semibold text-violet-500">Done</button>
					</div>
					<p class="mb-3 text-[11.5px] text-neutral-400">Tap to add or remove. Tags applied by a rule stay until the rule is changed.</p>

					<div class="flex flex-col gap-1">
						{#each tagStore.tags as tag (tag.name)}
							{@const src = tagSource(thread, tag.name)}
							<button
								type="button"
								disabled={src === 'rule'}
								onclick={() => toggleThreadTag(thread.id, tag.name)}
								class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left {src ? 'bg-neutral-50' : ''}"
							>
								<span class="h-2.5 w-2.5 shrink-0 rounded-full {tag.dot}"></span>
								<span class="flex-1 text-[13.5px] font-medium text-ink">{tag.name}</span>
								{#if src === 'rule'}
									<span class="text-[10.5px] font-medium text-neutral-400">via rule</span>
								{/if}
								<span
									class="flex h-5 w-5 items-center justify-center rounded-full {src
										? 'bg-violet-500 text-white'
										: 'ring-1 ring-neutral-300'}"
								>
									{#if src}
										<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none">
											<path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
										</svg>
									{/if}
								</span>
							</button>
						{/each}
					</div>

					<form
						class="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3"
						onsubmit={(e) => {
							e.preventDefault();
							addNewTag();
						}}
					>
						<input
							bind:value={newTag}
							placeholder="New tag name…"
							class="min-w-0 flex-1 rounded-full bg-neutral-100 px-4 py-2.5 text-[13px] text-ink placeholder:text-neutral-400 focus:outline-none"
						/>
						<button
							type="submit"
							disabled={!newTag.trim()}
							class="tap-scale shrink-0 rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-semibold text-white disabled:opacity-30"
						>
							Create & add
						</button>
					</form>
				</div>
			</div>
		{/if}
	</div>
{/if}
