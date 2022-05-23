<script lang="ts">
	import { useEffect } from '$lib/hooks';
	import { useSpeechRecognition } from '$lib/SpeechRecognition';

	let transcribing = true;
	let clearTranscriptOnListen = true;
	const toggleTranscribing = () => (transcribing = !transcribing);
	const toggleClearTranscriptOnListen = () => (clearTranscriptOnListen = !clearTranscriptOnListen);

	export let commands: any[] = [];
	const {
		// transcript,
		// interimTranscript,
		// finalTranscript,
		resetTranscript,
		listening,
		browserSupportsSpeechRecognition,
		isMicrophoneAvailable,
		transcriptStore
	} = useSpeechRecognition({ transcribing, clearTranscriptOnListen, commands });
	// useEffect(
	// 	() => {
	// 		if (interimTranscript !== '') {
	// 			console.log('Got interim result:', interimTranscript);
	// 		}
	// 		if (finalTranscript !== '') {
	// 			console.log('Got final result:', finalTranscript);
	// 		}
	// 	},
	// 	() => [interimTranscript, finalTranscript]
	// );

	$: console.log($transcriptStore);
</script>

{#if browserSupportsSpeechRecognition}
	<span>No browser support</span>
{:else}
	{#if !isMicrophoneAvailable}
		<span>Please allow access to the microphone</span>
	{/if}

	<div style="display: 'flex'; flexDirection: 'column';">
		<div>
			<span>listening: {listening ? 'on' : 'off'}</span>
			<span>transcribing: {transcribing ? 'on' : 'off'}</span>
			<span>clearTranscriptOnListen: {clearTranscriptOnListen ? 'on' : 'off'}</span>
		</div>
		<button on:click={resetTranscript}>Reset</button>
		<button on:click={toggleTranscribing}>Toggle transcribing</button>
		<button on:click={toggleClearTranscriptOnListen}>Toggle clearTranscriptOnListen</button>
		<span>{$transcriptStore.finalTranscript || $transcriptStore.interimTranscript}</span>
	</div>
{/if}
