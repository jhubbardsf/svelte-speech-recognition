/* eslint-disable @typescript-eslint/no-explicit-any */
import { reducible } from './stores.js';
import {
    commandToRegExp,
    compareTwoStringsUsingDiceCoefficient,
    browserSupportsPolyfills
} from './utils'
import { clearTranscript, appendTranscript } from './actions'
// import { transcriptReducer } from './reducers'
import RecognitionManager from './RecognitionManager'
import isAndroid from './isAndroid'
import { NativeSpeechRecognition } from './NativeSpeechRecognition'
import type { SpeechRecognitionClass } from '@speechly/speech-recognition-polyfill'
import { useEffect } from './hooks.js';
import { browser } from '$app/env';
import { get, writable } from 'svelte/store';

let _browserSupportsSpeechRecognition = !!NativeSpeechRecognition
let _browserSupportsContinuousListening = _browserSupportsSpeechRecognition && !isAndroid()
let recognitionManager: RecognitionManager

const useSpeechRecognition = ({
    transcribing = true,
    clearTranscriptOnListen = true,
    commands = []
}: { transcribing: boolean, clearTranscriptOnListen: boolean, commands: any[] }) => {
    const transcribingStore = writable(transcribing);
    const transcriptStore = writable({ interimTranscript: '', finalTranscript: '' });
    const recognitionManager = SpeechRecognition.getRecognitionManager();
    let browserSupportsSpeechRecognition = !browser ? true : _browserSupportsSpeechRecognition;
    let browserSupportsContinuousListening = _browserSupportsContinuousListening;
    // const [transcriptStore, dispatch] = reducible({
    //     interimTranscript: recognitionManager.interimTranscript,
    //     finalTranscript: ''
    // }, transcriptReducer)

    let listening = recognitionManager.listening;
    let isMicrophoneAvailable = recognitionManager.isMicrophoneAvailable
    const commandsRef = commands;

    const dispatchClearTranscript = () => {
        // TODO: Redo this now
        //     dispatch(clearTranscript())
        transcriptStore.set({ interimTranscript: '', finalTranscript: '' })
    };

    const resetTranscript = () => {
        console.log('Hit reset transcript.');
        recognitionManager.resetTranscript()
        dispatchClearTranscript()
    };

    const testFuzzyMatch = (command: any, input: string, fuzzyMatchingThreshold: number) => {
        console.log("testFuzzyMatch: ", { command, input, fuzzyMatchingThreshold });
        const commandToString = (typeof command === 'object') ? command.toString() : command
        const commandWithoutSpecials = commandToString
            .replace(/[&/\\#,+()!$~%.'":*?<>{}]/g, '')
            .replace(/  +/g, ' ')
            .trim()
        const howSimilar = compareTwoStringsUsingDiceCoefficient(commandWithoutSpecials, input)
        if (howSimilar >= fuzzyMatchingThreshold) {
            return {
                command,
                commandWithoutSpecials,
                howSimilar,
                isFuzzyMatch: true
            }
        }
        return null
    }

    const testMatch = (command: any, input: string) => {
        const pattern = commandToRegExp(command)
        const result = pattern.exec(input)
        if (result) {
            return {
                command,
                parameters: result.slice(1)
            }
        }
        return null
    }

    const matchCommands = (newInterimTranscript: string, newFinalTranscript: string) => {
        commandsRef.forEach(({
            command,
            callback,
            matchInterim = false,
            isFuzzyMatch = false,
            fuzzyMatchingThreshold = 0.8,
            bestMatchOnly = false
        }) => {
            const input = !newFinalTranscript && matchInterim
                ? newInterimTranscript.trim()
                : newFinalTranscript.trim()
            const subcommands = Array.isArray(command) ? command : [command]
            const results = subcommands.map(subcommand => {
                if (isFuzzyMatch) {
                    return testFuzzyMatch(subcommand, input, fuzzyMatchingThreshold)
                }
                return testMatch(subcommand, input)
            }).filter(x => x)
            if (isFuzzyMatch && bestMatchOnly && results.length >= 2) {
                //@ts-expect-error Fix later
                results.sort((a, b) => b.howSimilar - a.howSimilar)
                const command = results[0]?.command;
                //@ts-expect-error Fix later
                const commandWithoutSpecials = results[0]?.commandWithoutSpecials;
                //@ts-expect-error Fix later
                const howSimilar = results[0]?.howSimilar;

                callback(commandWithoutSpecials, input, howSimilar, { command, resetTranscript })
            } else {
                results.forEach(result => {
                    //@ts-expect-error Fix later
                    if (result.isFuzzyMatch) {
                        //@ts-expect-error Fix later
                        const { command, commandWithoutSpecials, howSimilar } = result
                        callback(commandWithoutSpecials, input, howSimilar, { command, resetTranscript })
                    } else {
                        //@ts-expect-error Fix later
                        const { command, parameters } = result
                        callback(...parameters, { command, resetTranscript })
                    }
                })
            }
        })
    }

    const handleTranscriptChange = (newInterimTranscript: string, newFinalTranscript: string) => { // Handle this with a svelte store
        console.log("handleTranscriptChange: ", { newInterimTranscript, newFinalTranscript });
        const isTranscribing = get(transcribingStore);
        if (isTranscribing) {
            // dispatch(appendTranscript(newInterimTranscript, newFinalTranscript))
            const currentFinal = get(transcriptStore).finalTranscript;
            transcriptStore.set({
                interimTranscript: newInterimTranscript,
                finalTranscript: currentFinal + newFinalTranscript
            })
        }
        matchCommands(newInterimTranscript, newFinalTranscript)
    }

    const handleClearTranscript = (clearTranscriptOnListen: boolean) => {
        if (clearTranscriptOnListen) {
            dispatchClearTranscript()
        }
    }

    useEffect(() => {
        console.log("Inside useEffect");
        const id = SpeechRecognition.counter
        SpeechRecognition.counter += 1

        const callbacks = {
            onListeningChange: (newListening: boolean) => listening = newListening,
            onMicrophoneAvailabilityChange: (newMicrophoneAvailability: boolean) => isMicrophoneAvailable = newMicrophoneAvailability,
            onTranscriptChange: handleTranscriptChange,
            onClearTranscript: handleClearTranscript,
            onBrowserSupportsSpeechRecognitionChange: (newBrowserSupportsSpeechRecognition: boolean) => browserSupportsSpeechRecognition = newBrowserSupportsSpeechRecognition,
            onBrowserSupportsContinuousListeningChange: (newBrowserSupportsContinuousListening: boolean) => browserSupportsContinuousListening = newBrowserSupportsContinuousListening
        }
        recognitionManager.subscribe(id, callbacks)

        return () => {
            recognitionManager.unsubscribe(id)
        }
    }, () => [
        transcribing, // This isn't being used properly
        clearTranscriptOnListen,
        recognitionManager,
        handleTranscriptChange,
        handleClearTranscript
    ])

    return {
        transcribing: transcribingStore,
        listening,
        isMicrophoneAvailable,
        resetTranscript,
        browserSupportsSpeechRecognition,
        browserSupportsContinuousListening,
        transcriptStore
    }
}
const SpeechRecognition = {
    counter: 0,
    applyPolyfill: (PolyfillSpeechRecognition: SpeechRecognitionClass) => {
        if (recognitionManager) {
            recognitionManager.setSpeechRecognition(PolyfillSpeechRecognition)
        } else {
            recognitionManager = new RecognitionManager(PolyfillSpeechRecognition)
        }
        const browserSupportsPolyfill = !!PolyfillSpeechRecognition && browserSupportsPolyfills()
        _browserSupportsSpeechRecognition = browserSupportsPolyfill
        _browserSupportsContinuousListening = browserSupportsPolyfill
    },
    getRecognitionManager: () => {
        if (!recognitionManager) {
            recognitionManager = new RecognitionManager(NativeSpeechRecognition)
        }
        return recognitionManager
    },
    getRecognition: () => {
        const recognitionManager = SpeechRecognition.getRecognitionManager()
        return recognitionManager.getRecognition()
    },
    startListening: async ({ continuous = false, language = 'en-US' } = {}) => {
        console.log("startListening: ", { continuous, language });
        const recognitionManager = SpeechRecognition.getRecognitionManager()
        await recognitionManager.startListening({ continuous, language })
    },
    stopListening: async () => {
        const recognitionManager = SpeechRecognition.getRecognitionManager()
        await recognitionManager.stopListening()
    },
    abortListening: async () => {
        const recognitionManager = SpeechRecognition.getRecognitionManager()
        await recognitionManager.abortListening()
    },
    browserSupportsSpeechRecognition: () => _browserSupportsSpeechRecognition,
    browserSupportsContinuousListening: () => _browserSupportsContinuousListening
}

export { useSpeechRecognition }
export default SpeechRecognition