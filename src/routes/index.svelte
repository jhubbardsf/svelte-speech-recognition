<script lang="ts">
	import { onMount } from 'svelte';
	import {
		type SpeechRecognition,
		createSpeechlySpeechRecognition
	} from '@speechly/speech-recognition-polyfill';

	const SPEECHLY_APP_ID = '8a8f8d27-95f8-4c25-95d2-bb06ee01d8a0';

	let recognition: SpeechRecognition;
	let transcript: string[] = [];
	let transcriptIndex = 0;

	$: console.log({ recognition });

	const addToTranscript = (text: string) => {
		transcript[transcriptIndex] = text;
		transcriptIndex++;
	};

	onMount(async () => {
		let NativeSpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (navigator.brave) NativeSpeechRecognition = undefined;

		window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		const SpeechRecognition =
			NativeSpeechRecognition || createSpeechlySpeechRecognition(SPEECHLY_APP_ID);

		// recognition = new SpeechRecognition();
		recognition = new SpeechRecognition();
		recognition.interimResults = true;
		recognition.continuous = true;

		recognition.onerror = (e) => {
			console.log('Error has occurred: ', e);
		};

		recognition.onresult = (e) => {
			console.log('Result: ', e);
			transcript[transcriptIndex] = e.results[0][0].transcript;
			if (e.results[0].isFinal) transcriptIndex++;
		};

		recognition.onstart = () => {
			addToTranscript('--Starting Transcript--');
		};

		recognition.onend = () => {
			addToTranscript('--Stopping Transcript--');
		};

		const isNative = SpeechRecognition === NativeSpeechRecognition;

		let _browserSupportsSpeechRecognition = !!NativeSpeechRecognition;

		console.log({ SPEECHLY_APP_ID });
		console.log({ _browserSupportsSpeechRecognition });
		console.log({ isNative });
	});

	const start = () => {
		console.log('Start has been clicked (this is not a callback)');
		recognition.start();
	};
</script>

<section>
	Speech Recognition Test
	<div class="words" contenteditable>
		{#each transcript as phrase}
			<div>{phrase}</div>
		{/each}
	</div>

	<button
		on:mousedown={() => console.log('Mouse down')}
		on:mouseup={() => console.log('Mouse up')}
		on:click={start}>Start</button
	>
	<button on:click={() => recognition.stop()}>Stop</button>
</section>
