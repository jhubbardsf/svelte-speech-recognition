# svelte-speech-recognition
A Svelte library that converts speech from the microphone to text and makes it available to your Svelte components. This is a WIP and is originally based off the [react-speech-recognition](https://github.com/JamesBrill/react-speech-recognition) library. 

## How it works
`useSpeechRecognition` is a Svelte hook that gives a component access to a transcript of speech picked up from the user's microphone.

`SpeechRecognition` manages the global state of the Web Speech API, exposing functions to turn the microphone on and off.

Under the hood,
it uses [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition). Note that browser support for this API is currently limited, with Chrome having the best experience - see [supported browsers](#supported-browsers) for more information.

## Useful links

* [Basic example](#basic-example)
* [Why you should use a polyfill with this library](#why-you-should-use-a-polyfill-with-this-library)
* [Cross-browser example](#cross-browser-example)
* [Polyfills](docs/POLYFILLS.md)
* [API docs](#)

## Installation

To install:

`npm install --save-dev svelte-speech-recognition`

To import in your Svelte code:

`import SpeechRecognition, { useSpeechRecognition } from 'svelte-speech-recognition'`

## Basic example

The most basic example of a component using this hook would be:

```
<script lang='ts'>
import { useSpeechRecognition } from 'svelte-speech-recognition';

const {
    transcriptStore,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
} = useSpeechRecognition();
</script>

This is the final transcript:
{$transcriptStore.finalTranscript}

This is the interim transcript:
{$transcriptStore.interimTranscript}
```

You can see more examples in the example Svelte app attached to this repo. See [Developing](#developing).

## Why you should use a polyfill with this library

By default, speech recognition is not supported in all browsers, with the best native experience being available on desktop Chrome. To avoid the limitations of native browser speech recognition, it's recommended that you combine `svelte-speech-recognition` with a [speech recognition polyfill](docs/POLYFILLS.md). Why? Here's a comparison with and without polyfills:
* ✅ With a polyfill, your web app will be voice-enabled on all modern browsers (except Internet Explorer)
* ❌ Without a polyfill, your web app will only be voice-enabled on the browsers listed [here](#supported-browsers)
* ✅ With a polyfill, your web app will have a consistent voice experience across browsers
* ❌ Without a polyfill, different native implementations will produce different transcriptions, have different levels of accuracy, and have different formatting styles
* ✅ With a polyfill, you control who is processing your users' voice data
* ❌ Without a polyfill, your users' voice data will be sent to big tech companies like Google or Apple to be transcribed
* ✅ With a polyfill, `svelte-speech-recognition` will be suitable for use in commercial applications
* ❌ Without a polyfill, `svelte-speech-recognition` will still be fine for personal projects or use cases where cross-browser support is not needed
 
`svelte-speech-recognition` currently supports polyfills for the following cloud providers:

<div>
  <a href="https://www.speechly.com/?utm_source=github">
    <img src="docs/logos/speechly.png" width="200" alt="Speechly">
  </a>
  <img width="50"></img>
  <a href="https://azure.microsoft.com/en-gb/services/cognitive-services/speech-to-text/">
    <img src="docs/logos/microsoft.png" width="175" alt="Microsoft Azure Cognitive Services">
  </a>
</div>

## Cross-browser example

You can find the full guide for setting up a polyfill [here](docs/POLYFILLS.md). Alternatively, here is a quick (and free) example using Speechly:
* Install `@speechly/speech-recognition-polyfill` in your web app
* You will need a Speechly app ID. To get one of these, sign up for free with Speechly and follow [the guide here](https://docs.speechly.com/quick-start/stt-only/)
* Here's a component for a push-to-talk button. The basic example above would also work fine.
```
<script>
    import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
    import SpeechRecognition, { useSpeechRecognition } from 'svelte-speech-recognition';

    const appId = '<INSERT_SPEECHLY_APP_ID_HERE>';
    const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
    SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);


    const {
        transcriptStore,
        listening,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();
    const startListening = () => SpeechRecognition.startListening({ continuous: true });
</script>

{#if (!browserSupportsSpeechRecognition)}
    Browser doesn't support speech recognition
{:else}
    <div>
        <p>Microphone: {listening ? 'on' : 'off'}</p>
        <button
        onTouchStart={startListening}
        onMouseDown={startListening}
        onTouchEnd={SpeechRecognition.stopListening}
        onMouseUp={SpeechRecognition.stopListening}
        >Hold to talk</button>
        <p>{$transcriptStore.finalTranscript}</p>
    </div>
{/if}
```

## Detecting browser support for Web Speech API

If you choose not to use a polyfill, this library still fails gracefully on browsers that don't support speech recognition. It is recommended that you render some fallback content if it is not supported by the user's browser:

```
{#if (!browserSupportsSpeechRecognition)}
  // Render some fallback content
{/if}
```

### Supported browsers

Without a polyfill, the Web Speech API is largely only supported by Google browsers. As of May 2021, the following browsers support the Web Speech API:

* Chrome (desktop): this is by far the smoothest experience
* Safari 14.1
* Microsoft Edge
* Chrome (Android): a word of warning about this platform, which is that there can be an annoying beeping sound when turning the microphone on. This is part of the Android OS and cannot be controlled from the browser
* Android webview
* Samsung Internet

For all other browsers, you can render fallback content using the `SpeechRecognition.browserSupportsSpeechRecognition` function described above. Alternatively, as mentioned before, you can integrate a [polyfill](docs/POLYFILLS.md).

## Detecting when the user denies access to the microphone

Even if the browser supports the Web Speech API, the user still has to give permission for their microphone to be used before transcription can begin. They are asked for permission when `svelte-speech-recognition` first tries to start listening. At this point, you can detect when the user denies access via the `isMicrophoneAvailable` state. When this becomes `false`, it's advised that you disable voice-driven features and indicate that microphone access is needed for them to work.

```
{#if (!isMicrophoneAvailable)}
  // Render some fallback content
{/if}
```

## Controlling the microphone

Before consuming the transcript, you should be familiar with `SpeechRecognition`, which gives you control over the microphone. The state of the microphone is global, so any functions you call on this object will affect _all_ components using `useSpeechRecognition`.

### Turning the microphone on

To start listening to speech, call the `startListening` function.

```
SpeechRecognition.startListening()
```

This is an asynchronous function, so it will need to be awaited if you want to do something after the microphone has been turned on.

### Turning the microphone off

To turn the microphone off, but still finish processing any speech in progress, call `stopListening`.

```
SpeechRecognition.stopListening()
```

To turn the microphone off, and cancel the processing of any speech in progress, call `abortListening`.

```
SpeechRecognition.abortListening()
```

## Consuming the microphone transcript

To make the microphone transcript available as a Svelte store in your component. It has the interimTranscript and finalTranscript object, simply add:

```
const { transcriptStore } = useSpeechRecognition()
```

## Resetting the microphone transcript

To set the transcript to an empty string, you can call the `resetTranscript` function provided by `useSpeechRecognition`. Note that this is local to your component and does not affect any other components using Speech Recognition.

```
const { resetTranscript } = useSpeechRecognition()
```

## Commands

To respond when the user says a particular phrase, you can pass in a list of commands to the `useSpeechRecognition` hook. Each command is an object with the following properties:
- `command`: This is a string or `RegExp` representing the phrase you want to listen for. If you want to use the same callback for multiple commands, you can also pass in an array here, with each value being a string or `RegExp`
- `callback`: The function that is executed when the command is spoken. The last argument that this function receives will always be an object containing the following properties:
  - `command`: The command phrase that was matched. This can be useful when you provide an array of command phrases for the same callback and need to know which one triggered it
  - `resetTranscript`: A function that sets the transcript to an empty string
- `matchInterim`: Boolean that determines whether "interim" results should be matched against the command. This will make your component respond faster to commands, but also makes false positives more likely - i.e. the command may be detected when it is not spoken. This is `false` by default and should only be set for simple commands.
- `isFuzzyMatch`: Boolean that determines whether the comparison between speech and `command` is based on similarity rather than an exact match. Fuzzy matching is useful for commands that are easy to mispronounce or be misinterpreted by the Speech Recognition engine (e.g. names of places, sports teams, restaurant menu items). It is intended for commands that are string literals without special characters. If `command` is a string with special characters or a `RegExp`, it will be converted to a string without special characters when fuzzy matching. The similarity that is needed to match the command can be configured with `fuzzyMatchingThreshold`. `isFuzzyMatch` is `false` by default. When it is set to `true`, it will pass four arguments to `callback`:
  - The value of `command` (with any special characters removed)
  - The speech that matched `command`
  - The similarity between `command` and the speech
  - The object mentioned in the `callback` description above
- `fuzzyMatchingThreshold`: If the similarity of speech to `command` is higher than this value when `isFuzzyMatch` is turned on, the `callback` will be invoked. You should set this only if `isFuzzyMatch` is `true`. It takes values between `0` (will match anything) and `1` (needs an exact match). The default value is `0.8`.
- `bestMatchOnly`: Boolean that, when `isFuzzyMatch` is `true`, determines whether the callback should only be triggered by the command phrase that _best_ matches the speech, rather than being triggered by all matching fuzzy command phrases. This is useful for fuzzy commands with multiple command phrases assigned to the same callback function - you may only want the callback to be triggered once for each spoken command. You should set this only if `isFuzzyMatch` is `true`. The default value is `false`.

### Command symbols

To make commands easier to write, the following symbols are supported:
- Splats: this is just a `*` and will match multi-word text:
  - Example: `'I would like to order *'`
  - The words that match the splat will be passed into the callback, one argument per splat
- Named variables: this is written `:<name>` and will match a single word:
  - Example: `'I am :height metres tall'`
  - The one word that matches the named variable will be passed into the callback
- Optional words: this is a phrase wrapped in parentheses `(` and `)`, and is not required to match the command:
  - Example: `'Pass the salt (please)'`
  - The above example would match both `'Pass the salt'` and `'Pass the salt please'`

### Example with commands
```svelte
<script lang="ts">
  import SpeechRecognition, { useSpeechRecognition } from 'svelte-speech-recognition';

  let message = '';
  const setMessage = (newMessage: string) => (message = newMessage);

  const commands = [
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
      callback: ({ resetTranscript }: { resetTranscript: any }) => resetTranscript(),
      matchInterim: true
    }
  ];

  const { transcriptStore, browserSupportsSpeechRecognition } = useSpeechRecognition({ commands });
  const startListening = () => SpeechRecognition.startListening({ continuous: true });
</script>

{#if browserSupportsSpeechRecognition}
  <div>
    <p>{message}</p>
    <p>{$transcriptStore.finalTranscript}</p>
  </div>
{:else}
  <p>Browser does not support speech recognition.</p>
{/if}

```