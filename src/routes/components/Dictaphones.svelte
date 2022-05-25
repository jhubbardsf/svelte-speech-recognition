<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Listen from '$lib/components/Listen.svelte';
	import Stop from '$lib/components/Stop.svelte';
	import SpeechRecognition from '$lib/SpeechRecognition';
	import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
	import DictaphoneWidgetA from './_Dictaphone/DictaphoneWidgetA.svelte';
	import DictaphoneWidgetB from './_Dictaphone/DictaphoneWidgetB.svelte';

	const appId = '8a8f8d27-95f8-4c25-95d2-bb06ee01d8a0';
	const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
	SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

	let showFirstWidget = true;
	const toggleShowFirstWidget = () => (showFirstWidget = !showFirstWidget);
</script>

<div>
	{#if showFirstWidget}
		<DictaphoneWidgetA />
	{/if}
	<DictaphoneWidgetB />

	<div class="flex pt-4 justify-center">
		<Listen {SpeechRecognition} />
		<Listen {SpeechRecognition} continuous={true} />
		<Listen
			{SpeechRecognition}
			continuous={true}
			language="zh-CN"
			buttonText="Listen Continuously (Chinese)"
		/>
		<div on:click={toggleShowFirstWidget}>
			<Button>Toggle first widget</Button>
		</div>
		<Stop {SpeechRecognition}>
			<button class="border border-solid p-2 border-black rounded">Stop</button>
		</Stop>
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
