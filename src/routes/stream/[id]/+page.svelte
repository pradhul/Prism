<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getThread } from '$lib/state/inbox.svelte';
	import ThreadDetail from '$lib/components/stream/ThreadDetail.svelte';

	const thread = $derived(getThread(page.params.id ?? ''));

	function back() {
		// history.back() is instant when we came from the stream; goto is the cold-start fallback
		if (history.length > 1) history.back();
		else goto('/stream');
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
	{#key thread.id}
		<ThreadDetail {thread} variant="page" onclose={back} />
	{/key}
{/if}
