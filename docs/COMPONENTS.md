# Svelte Components

Below are the listen of Svelte components, their props, and what they can do. For code examples please look in [src/routes/components/Dictaphones.svelte](../src/routes/components/Dictaphones.svelte). Components come with a default button for testing but have a slot you can customize.

- [Svelte Components](#svelte-components)
  - [Example w/ Ponyfill](#example-w-ponyfill)
  - [Listen](#listen)
  - [Stop](#stop)

---

## Example w/ Ponyfill

```sv
<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Listen from '$lib/components/Listen.svelte';
	import Stop from '$lib/components/Stop.svelte';
	import SpeechRecognition from '$lib/SpeechRecognition';
	import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
	import DictaphoneWidgetA from './_Dictaphone/DictaphoneWidgetA.svelte';
	import DictaphoneWidgetB from './_Dictaphone/DictaphoneWidgetB.svelte';

	const appId = '<SPEECHLY_APP_API>';
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
```

---
## Listen 
Props:
* `language: string` Speech Recognition API language (support types [here](./API.md#language))
* `continuous: boolean` Whether it will listen continuously or for one phrase
* `SpeechRecognition` Instance of SpeechRecognition object
* `buttonText: string` String you can customize for default button text

Use:

    When the user clicks on this component the Speech Recognition API will start listening for text/commands.

---

## Stop
Props:
* `SpeechRecognition` Instance of SpeechRecognition object
  
Use:

    When the clicks on this component the Speech Recognition API will stop.

