<script lang="ts">
	import Dictaphone from './Dictaphone.svelte';

	let message = '';
	const setMessage = (newMessage: string) => (message = newMessage);

	const commands = [
		{
			command: '* is my name',
			callback: (name: string) => setMessage(`Hi ${name}!`),
			matchInterim: true
		},
		{
			command: 'My top sports are * and *',
			callback: (sport1: string, sport2: string) => setMessage(`#1: ${sport1}, #2: ${sport2}`)
		},
		{
			command: 'Goodbye',
			callback: () => setMessage('So long!'),
			matchInterim: true
		},
		{
			command: 'Pass the salt (please)',
			callback: () => setMessage('My pleasure')
		}
	];
</script>

<div class="dictaphone">
	<h3>Dictaphone B</h3>
	<div class="response">
		<b>Bot Response: {message}</b>
	</div>

	<div>
		<Dictaphone {commands} />
	</div>
</div>

<style>
	.dictaphone {
		border: 1px solid black;
		padding: 15px;
	}
	.response {
		font-size: large;
		margin-bottom: 10px;
	}
</style>
