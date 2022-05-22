<script lang="ts">
	import { useSpeechRecognition } from '$lib/SpeechRecognition';

	let transcribing = true;
	let clearTranscriptOnListen = true;

	export let commands: any[] = [];
	const {
		transcript,
		interimTranscript,
		finalTranscript,
		resetTranscript,
		listening,
		browserSupportsSpeechRecognition,
		isMicrophoneAvailable
	} = useSpeechRecognition({ transcribing, clearTranscriptOnListen, commands });

	// const resetTranscript = () => console.log('reset transccript');
	const toggleTranscribing = () => (transcribing = !transcribing);
	const toggleClearTranscriptOnListen = () => (clearTranscriptOnListen = !clearTranscriptOnListen);

	// OLD STUFF
	// const [transcribing, setTranscribing] = useState(true);
	// const [clearTranscriptOnListen, setClearTranscriptOnListen] = useState(true);
	// const toggleTranscribing = () => setTranscribing(!transcribing);
	// const toggleClearTranscriptOnListen = () => setClearTranscriptOnListen(!clearTranscriptOnListen);
	// const {
	// 	transcript,
	// 	interimTranscript,
	// 	finalTranscript,
	// 	resetTranscript,
	// 	listening,
	// 	browserSupportsSpeechRecognition,
	// 	isMicrophoneAvailable
	// } = useSpeechRecognition({ transcribing, clearTranscriptOnListen, commands });
	// useEffect(() => {
	// 	if (interimTranscript !== '') {
	// 		console.log('Got interim result:', interimTranscript);
	// 	}
	// 	if (finalTranscript !== '') {
	// 		console.log('Got final result:', finalTranscript);
	// 	}
	// }, [interimTranscript, finalTranscript]);

	// if (!browserSupportsSpeechRecognition) {
	// 	return <span>No browser support</span>;
	// }

	// if (!isMicrophoneAvailable) {
	// 	return <span>Please allow access to the microphone</span>;
	// }
</script>

<div style="display: 'flex'; flexDirection: 'column';">
	<div>
		<span>listening: {listening ? 'on' : 'off'}</span>
		<span>transcribing: {transcribing ? 'on' : 'off'}</span>
		<span>clearTranscriptOnListen: {clearTranscriptOnListen ? 'on' : 'off'}</span>
	</div>
	<button on:click={resetTranscript}>Reset</button>
	<button on:click={toggleTranscribing}>Toggle transcribing</button>
	<button on:click={toggleClearTranscriptOnListen}>Toggle clearTranscriptOnListen</button>
	<span>{transcript}</span>
</div>
