<script lang="ts">
	import { useSpeechRecognition } from '$lib/SpeechRecognition';
	import type { Command } from '$lib/types';

	const toggleTranscribing = () => ($transcribing = !$transcribing);
	const toggleClearTranscriptOnListen = () =>
		($clearTranscriptOnListen = !$clearTranscriptOnListen);

	export let commands: Command[] = [];
	const {
		transcribing,
		clearTranscriptOnListen,
		resetTranscript,
		listening,
		browserSupportsSpeechRecognition,
		isMicrophoneAvailable,
		transcriptStore
	} = useSpeechRecognition({
		transcribing: true,
		clearTranscriptOnListen: true,
		commands
	});

	$: console.log($transcriptStore);
</script>

{#if browserSupportsSpeechRecognition}
	{#if !isMicrophoneAvailable}
		<span>Please allow access to the microphone</span>
	{/if}

	<div style="display: 'flex'; flexDirection: 'column';">
		<div>
			<span>listening: {$listening ? 'on' : 'off'}</span>
			<span>transcribing: {$transcribing ? 'on' : 'off'}</span>
			<span>clearTranscriptOnListen: {$clearTranscriptOnListen ? 'on' : 'off'}</span>
		</div>
		<button on:click={resetTranscript}>Reset</button>
		<button on:click={toggleTranscribing}>Toggle transcribing</button>
		<button on:click={toggleClearTranscriptOnListen}>Toggle clearTranscriptOnListen</button>
		<span>{$transcriptStore.finalTranscript || $transcriptStore.interimTranscript}</span>
	</div>
{:else}
	<span>No browser support</span>
{/if}

<style>
	span {
		display: block;
	}
	button {
		width: 100%;
	}
</style>
