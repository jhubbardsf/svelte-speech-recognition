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

<div>
	<h3>Dictaphone B</h3>
	<p>{message}</p>
	<Dictaphone {commands} />
</div>
