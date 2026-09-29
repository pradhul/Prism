<script lang="ts">
	import { fade, fly, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut, expoOut } from 'svelte/easing';
	import {
		tagStore,
		tagCount,
		createTag,
		deleteTag,
		ruleStore,
		ruleSentence,
		ruleHits,
		toggleRule,
		deleteRule,
		parseRuleDraft,
		confirmRuleDraft,
		builtinRules,
		type RuleDraft
	} from '$lib/state/organize.svelte';

	let newTag = $state('');
	let ruleText = $state('');
	let draft = $state<RuleDraft | null>(null);
	let draftError = $state<string | null>(null);
	let thinking = $state(false);

	function submitTag(e: Event) {
		e.preventDefault();
		if (createTag(newTag)) newTag = '';
	}

	function draftRule(e: Event) {
		e.preventDefault();
		draft = null;
		draftError = null;
		thinking = true;
		// brief pause so the "understanding…" state reads as deliberate
		setTimeout(() => {
			const parsed = parseRuleDraft(ruleText);
			thinking = false;
			if (parsed) draft = parsed;
			else
				draftError =
					"Couldn't work out a rule from that. Try naming a sender and what to do — e.g. “tag Swiggy and Zomato mails as Food” or “mark TLDR as read”.";
		}, 450);
	}

	const draftHits = $derived(
		draft
			? ruleHits({ id: 'draft', enabled: true, match: { senderIncludes: draft.senders }, action: draft.action })
			: 0
	);

	function acceptDraft() {
		if (!draft) return;
		confirmRuleDraft(draft);
		draft = null;
		ruleText = '';
	}
</script>

<div class="no-scrollbar flex-1 overflow-y-auto px-5 pb-10">
	<!-- Tags -->
	<section class="rise pt-1">
		<h2 class="text-[13px] font-semibold tracking-wide text-neutral-500 uppercase">Tags</h2>
		<p class="mt-0.5 mb-3 text-[11.5px] text-neutral-400">
			Labels you can pin on any mail. Rules below apply some automatically.
		</p>

		<div class="overflow-hidden rounded-[20px] bg-white shadow-glass ring-1 ring-black/[0.04]">
			{#each tagStore.tags as tag (tag.name)}
				<div
					class="flex items-center gap-3 border-b border-black/[0.03] px-4 py-3 last:border-b-0"
					in:fly={{ x: -12, duration: 260, easing: expoOut }}
					out:slide={{ duration: 200 }}
					animate:flip={{ duration: 240, easing: cubicOut }}
				>
					<span class="h-2.5 w-2.5 shrink-0 rounded-full {tag.dot}"></span>
					<span class="flex-1 text-[13.5px] font-medium text-ink">{tag.name}</span>
					<span class="text-[11.5px] text-neutral-400">{tagCount(tag.name).toLocaleString()} mails</span>
					<button
						type="button"
						onclick={() => deleteTag(tag.name)}
						aria-label={`Delete tag ${tag.name}`}
						class="tap-scale tap-icon flex h-6 w-6 items-center justify-center rounded-full text-neutral-300 hover:text-rose-500"
					>
						<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none">
							<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
						</svg>
					</button>
				</div>
			{/each}

			<form class="flex items-center gap-2 bg-neutral-50/60 px-3 py-2.5" onsubmit={submitTag}>
				<input
					bind:value={newTag}
					placeholder="New tag name…"
					class="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-[13px] text-ink ring-1 ring-black/[0.05] placeholder:text-neutral-400 transition-shadow focus:ring-violet-300 focus:outline-none"
				/>
				<button
					type="submit"
					disabled={!newTag.trim()}
					class="tap-scale shrink-0 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-white disabled:opacity-30"
				>
					Add
				</button>
			</form>
		</div>
	</section>

	<!-- Your rules -->
	<section class="rise pt-7" style="--rise-delay: 80ms">
		<h2 class="text-[13px] font-semibold tracking-wide text-neutral-500 uppercase">Your rules</h2>
		<p class="mt-0.5 mb-3 text-[11.5px] text-neutral-400">
			Describe a rule in plain words. Prism drafts it — you confirm before anything changes.
		</p>

		<form
			class="mb-3 flex flex-col gap-2.5 rounded-[20px] bg-white p-4 shadow-glass ring-1 transition-shadow {thinking
				? 'ring-violet-400'
				: 'ring-violet-200'}"
			onsubmit={draftRule}
		>
			<label class="flex flex-col gap-1.5">
				<span class="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
					<svg viewBox="0 0 24 24" class="h-3 w-3 text-violet-400 {thinking ? 'animate-pulse' : ''}" fill="currentColor">
						<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
					</svg>
					Tell Prism what to do
				</span>
				<textarea
					bind:value={ruleText}
					rows="2"
					placeholder="e.g. tag Swiggy and Zomato mails as Food — or mark TLDR as read"
					class="resize-none rounded-xl bg-neutral-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-neutral-400 focus:outline-none"
				></textarea>
			</label>
			<button
				type="submit"
				disabled={!ruleText.trim() || thinking}
				class="tap-scale rounded-full bg-ink py-2.5 text-[13px] font-semibold text-white disabled:opacity-30"
			>
				{thinking ? 'Understanding…' : 'Draft rule'}
			</button>
		</form>

		{#if draftError}
			<p class="mb-3 rounded-2xl bg-rose-50 px-4 py-3 text-[12.5px] leading-relaxed text-rose-600" transition:slide={{ duration: 220 }}>
				{draftError}
			</p>
		{/if}

		{#if draft}
			{@const s = ruleSentence({
				id: 'draft',
				enabled: true,
				match: { senderIncludes: draft.senders },
				action: draft.action
			})}
			<div
				class="mb-3 rounded-[20px] bg-violet-50 p-4 ring-1 ring-violet-200"
				in:fly={{ y: 14, duration: 380, easing: expoOut }}
				out:fade={{ duration: 140 }}
			>
				<p class="text-[11px] font-semibold tracking-wide text-violet-500 uppercase">Confirm this rule</p>
				<p class="mt-1.5 text-[13.5px] leading-snug font-medium text-ink">{s.when}</p>
				<p class="mt-0.5 text-[13px] text-violet-600">→ {s.then}</p>
				{#if draft.tagIsNew && draft.action.tag}
					<p class="mt-1.5 text-[11.5px] text-neutral-500">
						Will create a new <span class="font-semibold text-ink">{draft.action.tag}</span> tag.
					</p>
				{/if}
				<p class="mt-1 text-[11px] text-neutral-400">
					Matches {draftHits.toLocaleString()} {draftHits === 1 ? 'mail' : 'mails'} right now
				</p>
				<div class="mt-3 flex gap-2">
					<button type="button" onclick={acceptDraft} class="tap-scale flex-1 rounded-full bg-ink py-2.5 text-[13px] font-semibold text-white">
						Looks right — create
					</button>
					<button
						type="button"
						onclick={() => (draft = null)}
						class="tap-scale rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-500 ring-1 ring-black/[0.06]"
					>
						Try again
					</button>
				</div>
			</div>
		{/if}

		<div class="flex flex-col gap-2.5">
			{#each ruleStore.rules as rule (rule.id)}
				{@const s = ruleSentence(rule)}
				<div
					class="rounded-[20px] bg-white p-4 shadow-glass ring-1 ring-black/[0.04] transition-opacity duration-300 {rule.enabled ? '' : 'opacity-55'}"
					in:fly={{ y: 14, duration: 320, easing: expoOut }}
					out:fade={{ duration: 140 }}
					animate:flip={{ duration: 260, easing: cubicOut }}
				>
					<div class="flex items-start gap-3">
						<div class="min-w-0 flex-1">
							<p class="text-[13.5px] leading-snug font-medium text-ink">{s.when}</p>
							<p class="mt-0.5 text-[13px] text-violet-600">→ {s.then}</p>
							<p class="mt-1.5 text-[11px] text-neutral-400">
								{rule.enabled ? `Matches ${ruleHits(rule).toLocaleString()} mails right now` : 'Off — not applied'}
							</p>
						</div>
						<button
							type="button"
							role="switch"
							aria-checked={rule.enabled}
							aria-label={`Toggle rule`}
							onclick={() => toggleRule(rule.id)}
							class="relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors duration-200 {rule.enabled ? 'bg-violet-500' : 'bg-neutral-200'}"
						>
							<span
								class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] {rule.enabled
									? 'left-[18px]'
									: 'left-0.5'}"
							></span>
						</button>
					</div>
					<button
						type="button"
						onclick={() => deleteRule(rule.id)}
						class="tap-scale mt-2 text-[11px] font-semibold text-neutral-400 hover:text-rose-500"
					>
						Delete rule
					</button>
				</div>
			{/each}
			{#if ruleStore.rules.length === 0}
				<p class="rounded-2xl bg-white/60 p-4 text-center text-[12.5px] text-neutral-400" in:fade={{ duration: 200 }}>
					No rules yet — create one above.
				</p>
			{/if}
		</div>
	</section>

	<!-- Built-in intelligence -->
	<section class="rise pt-7" style="--rise-delay: 160ms">
		<h2 class="text-[13px] font-semibold tracking-wide text-neutral-500 uppercase">Built into Prism</h2>
		<p class="mt-0.5 mb-3 text-[11.5px] text-neutral-400">
			What the AI does on its own — shown here so the inbox is never a black box.
		</p>
		<div class="overflow-hidden rounded-[20px] bg-white shadow-glass ring-1 ring-black/[0.04]">
			{#each builtinRules as b (b.title)}
				<div class="flex items-start gap-3 border-b border-black/[0.03] px-4 py-3.5 last:border-b-0">
					<svg viewBox="0 0 24 24" class="mt-0.5 h-4 w-4 shrink-0 text-violet-400" fill="currentColor">
						<path d="M12 2l1.6 5.2a4 4 0 0 0 2.7 2.7L21.5 11.5l-5.2 1.6a4 4 0 0 0-2.7 2.7L12 21l-1.6-5.2a4 4 0 0 0-2.7-2.7L2.5 11.5l5.2-1.6a4 4 0 0 0 2.7-2.7L12 2z" />
					</svg>
					<div>
						<p class="text-[13px] font-semibold text-ink">{b.title}</p>
						<p class="mt-0.5 text-[12px] leading-relaxed text-neutral-500">{b.detail}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
