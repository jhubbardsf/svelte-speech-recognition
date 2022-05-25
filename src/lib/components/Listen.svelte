<script lang="ts">
	import type { SpeechRecognitionType } from '$lib/SpeechRecognition';
	import Button from './Button.svelte';

	export let language = 'en-US';
	export let continuous = false;
	export let SpeechRecognition: SpeechRecognitionType;
	export let buttonText = continuous ? 'Listen Continuously' : 'Listen Once';

	const startListening = () => SpeechRecognition.startListening({ continuous, language });
</script>

<div on:click={startListening}>
	<slot>
		<Button>
			{buttonText}
		</Button>
	</slot>
</div>
