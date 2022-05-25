<script lang="ts">
	import type { SpeechRecognitionType } from '$lib/SpeechRecognition';
	import Button from './Button.svelte';

	export let SpeechRecognition: SpeechRecognitionType;

	const stopListening = () => {
		console.log('Stop');
		SpeechRecognition.stopListening();
	};
</script>

<div on:click={stopListening}>
	<slot>
		<Button>stopListening</Button>
	</slot>
</div>
