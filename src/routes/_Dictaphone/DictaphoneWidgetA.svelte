<script lang="ts">
	import type { Command } from '$lib/types';
	import Dictaphone from './Dictaphone.svelte';

	let message = '';
	const setMessage = (newMessage: string) => (message = newMessage);

	const commands: Command[] = [
		{
			command: 'I would like to order *',
			callback: (food: string) => setMessage(`Your order is for: ${food}`),
			matchInterim: true
		},
		{
			command: 'The weather is :condition today',
			callback: (condition: string) => setMessage(`Today, the weather is ${condition}`)
		},
		{
			command: ['Hello', 'Hi'],
			callback: ({ command }: { command: string }) =>
				setMessage(`Hi there! You said: "${command}"`),
			matchInterim: true
		},
		{
			command: 'Beijing',
			callback: (command: string, spokenPhrase: string, similarityRatio: number) =>
				setMessage(`${command} and ${spokenPhrase} are ${similarityRatio * 100}% similar`),
			// If the spokenPhrase is "Benji", the message would be "Beijing and Benji are 40% similar"
			isFuzzyMatch: true,
			fuzzyMatchingThreshold: 0.2
		},
		{
			command: ['eat', 'sleep', 'leave'],
			callback: (command: string) => setMessage(`Best matching command: ${command}`),
			isFuzzyMatch: true,
			fuzzyMatchingThreshold: 0.2,
			bestMatchOnly: true
		},
		{
			command: 'clear',
			// @ts-expect-error Write a better type for this.
			callback: ({ resetTranscript }) => resetTranscript(),
			matchInterim: true
		}
	];
</script>

<div class="dictaphone">
	<h3>Dictaphone A</h3>
	<div class="response">
		<b>Bot Response: {message}</b>
	</div>

	<div>
		<Dictaphone {commands} />
	</div>
</div>

<style>
	.dictaphone {
		padding: 15px;
		margin-bottom: 10px;
		border: 1px solid black;
	}

	.response {
		font-size: large;
		margin-bottom: 10px;
	}
</style>
