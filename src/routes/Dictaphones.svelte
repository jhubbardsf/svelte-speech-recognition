<script lang="ts">
	// <!-- import React, { useState } from 'react' -->
	import SpeechRecognition from '$lib/SpeechRecognition';
	import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
	import DictaphoneWidgetA from './_Dictaphone/DictaphoneWidgetA.svelte';
	import DictaphoneWidgetB from './_Dictaphone/DictaphoneWidgetB.svelte';

	const appId = '8a8f8d27-95f8-4c25-95d2-bb06ee01d8a0';
	const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
	SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

	let showFirstWidget = true;
	const toggleShowFirstWidget = () => (showFirstWidget = !showFirstWidget);

	const listenContinuously = () =>
		SpeechRecognition.startListening({
			continuous: true,
			language: 'en-GB'
		});
	const listenContinuouslyInChinese = () =>
		SpeechRecognition.startListening({
			continuous: true,
			language: 'zh-CN'
		});
	const listenOnce = () => SpeechRecognition.startListening({ continuous: false });
</script>

<div>
	{#if showFirstWidget}
		<DictaphoneWidgetA />
	{/if}
	<DictaphoneWidgetB />
	<div class="buttons">
		<button on:click={listenOnce}>Listen once</button>
		<button on:click={listenContinuously}>Listen continuously</button>
		<button on:click={listenContinuouslyInChinese}>Listen continuously (Chinese)</button>
		<button on:click={toggleShowFirstWidget}>Toggle first widget</button>
		<button on:click={SpeechRecognition.stopListening}>Stop</button>
	</div>

	<section>
		<h1>Commands to Try</h1>
		<p class="explanation">
			Some commands to try saying: "YOUR_NAME is my name.", "The weather is CONDITION today.", "My
			top sports are TEAM and TEAM", "clear". Look in
			src/routes/_Dictaphone/DictaphoneWidgetA.svelte and
			src/routes/_Dictaphone/DictaphoneWidgetb.svelte to see more commands and how they work.
		</p>
	</section>
</div>

<style>
	.buttons {
		display: flex;
		justify-content: center;
	}

	.buttons button {
		padding: 5px;
		margin: 5px;
	}
</style>
