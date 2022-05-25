/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import isAndroid from './isAndroid'
import { isNative } from './NativeSpeechRecognition'
import { get, writable, type Writable } from 'svelte/store';
import { debounce, concatTranscripts, browserSupportsPolyfills } from '$lib/utils'
import type { SpeechRecognitionClass, SpeechRecognition, SpeechRecognitionErrorEvent } from '@speechly/speech-recognition-polyfill';


export default class RecognitionManager {
    recognition: SpeechRecognition | null;
    pauseAfterDisconnect: boolean;
    interimTranscript: string;
    finalTranscript: string;
    listening: Writable<boolean>;
    isMicrophoneAvailable: boolean;
    subscribers: any;
    onStopListening: any;
    previousResultWasFinalOnly: boolean;
    constructor(SpeechRecognition: SpeechRecognitionClass) {
        console.log('SpeechRecognition Constructor');
        this.recognition = null
        this.pauseAfterDisconnect = false
        this.interimTranscript = ''
        this.finalTranscript = ''
        this.listening = writable(false)
        this.isMicrophoneAvailable = true
        this.subscribers = {}
        this.onStopListening = () => { }
        this.previousResultWasFinalOnly = false

        this.resetTranscript = this.resetTranscript.bind(this)
        this.startListening = this.startListening.bind(this)
        this.stopListening = this.stopListening.bind(this)
        this.abortListening = this.abortListening.bind(this)
        this.setSpeechRecognition = this.setSpeechRecognition.bind(this)
        this.disableRecognition = this.disableRecognition.bind(this)

        this.setSpeechRecognition(SpeechRecognition)

        if (isAndroid()) {
            this.updateFinalTranscript = debounce(this.updateFinalTranscript, 250, true)
        }
    }

    setSpeechRecognition(SpeechRecognition: SpeechRecognitionClass) {
        console.log('setSpeechRecognition');
        const browserSupportsRecogniser = !!SpeechRecognition && (
            isNative(SpeechRecognition) || browserSupportsPolyfills()
        )
        if (browserSupportsRecogniser) {
            this.disableRecognition()
            this.recognition = new SpeechRecognition()
            this.recognition.continuous = false
            this.recognition.interimResults = true
            this.recognition.onresult = this.updateTranscript.bind(this)
            this.recognition.onend = this.onRecognitionDisconnect.bind(this)
            this.recognition.onerror = this.onError.bind(this)
        }
        // this.emitBrowserSupportsSpeechRecognitionChange(browserSupportsRecogniser)
    }

    subscribe(id: number, callbacks: any) {
        console.log('subscribe: ', { id, callbacks });
        this.subscribers[id] = callbacks
    }

    unsubscribe(id: number) {
        console.log('unsubscribe');
        delete this.subscribers[id]
    }

    emitListeningChange(listening: boolean) {
        console.log('emitListeningChange');
        this.listening.set(listening)
        Object.keys(this.subscribers).forEach((id) => {
            const { onListeningChange } = this.subscribers[id]
            onListeningChange(listening)
        })
    }

    emitMicrophoneAvailabilityChange(isMicrophoneAvailable: boolean) {
        console.log('emitMicrophoneAvailabilityChange');
        this.isMicrophoneAvailable = isMicrophoneAvailable
        Object.keys(this.subscribers).forEach((id) => {
            const { onMicrophoneAvailabilityChange } = this.subscribers[id]
            onMicrophoneAvailabilityChange(isMicrophoneAvailable)
        })
    }

    emitTranscriptChange(interimTranscript: string, finalTranscript: string) {
        console.log('emitTranscriptChange: ', { interimTranscript, finalTranscript });
        Object.keys(this.subscribers).forEach((id) => {
            const { onTranscriptChange } = this.subscribers[id]
            onTranscriptChange(interimTranscript, finalTranscript)
        })
    }

    emitClearTranscript() {
        console.log('emitClearTranscript');
        Object.keys(this.subscribers).forEach((id) => {
            const { onClearTranscript } = this.subscribers[id]
            onClearTranscript()
        })
    }

    disconnect(disconnectType: 'ABORT' | 'RESET' | 'STOP') {
        console.log('disconnect');
        if (this.recognition && get(this.listening)) {
            switch (disconnectType) {
                case 'ABORT':
                    this.pauseAfterDisconnect = true
                    this.abort()
                    break
                case 'RESET':
                    console.log('RESET SWITCH');
                    this.pauseAfterDisconnect = false
                    this.abort()
                    break
                case 'STOP':
                default:
                    this.pauseAfterDisconnect = true
                    this.stop()
            }
        }
    }

    disableRecognition() {
        console.log('disableRecognition');
        if (this.recognition) {
            this.recognition.onresult = () => { }
            this.recognition.onend = () => { }
            this.recognition.onerror = () => { }
            if (get(this.listening)) {
                this.stopListening()
            }
        }
    }

    onError(event: SpeechRecognitionErrorEvent) {
        console.log('onError');
        if (event && event.error && event.error === 'not-allowed') {
            this.emitMicrophoneAvailabilityChange(false)
            this.disableRecognition()
        }
    }

    onRecognitionDisconnect() {
        console.log('onRecognitionDisconnect');
        this.onStopListening()
        this.listening.set(false)
        if (this.pauseAfterDisconnect) {
            this.emitListeningChange(false)
        } else if (this.recognition) {
            if (this.recognition.continuous) {
                this.startListening({ continuous: this.recognition.continuous })
            } else {
                this.emitListeningChange(false)
            }
        }
        this.pauseAfterDisconnect = false
    }

    updateTranscript({ results, resultIndex }: { results: any, resultIndex: number }) {
        console.log('updateTranscript');
        const currentIndex = resultIndex === undefined ? results.length - 1 : resultIndex
        this.interimTranscript = ''
        this.finalTranscript = ''
        for (let i = currentIndex; i < results.length; ++i) {
            if (results[i].isFinal && (!isAndroid() || results[i][0].confidence > 0)) {
                this.updateFinalTranscript(results[i][0].transcript)
            } else {
                this.interimTranscript = concatTranscripts(
                    this.interimTranscript,
                    results[i][0].transcript
                )
            }
        }
        let isDuplicateResult = false
        if (this.interimTranscript === '' && this.finalTranscript !== '') {
            if (this.previousResultWasFinalOnly) {
                isDuplicateResult = true
            }
            this.previousResultWasFinalOnly = true
        } else {
            this.previousResultWasFinalOnly = false
        }
        if (!isDuplicateResult) {
            this.emitTranscriptChange(this.interimTranscript, this.finalTranscript)
        }
    }

    updateFinalTranscript(newFinalTranscript: string) {
        console.log('updateFinalTranscript');
        this.finalTranscript = concatTranscripts(
            this.finalTranscript,
            newFinalTranscript
        )
    }

    resetTranscript() {
        console.log('resetTranscript')
        this.disconnect('RESET')
    }

    async startListening({ continuous = false, language = 'en' } = {}) {
        console.log('startListening');
        if (!this.recognition) {
            return
        }

        const isContinuousChanged = continuous !== this.recognition.continuous
        // @ts-expect-error I believe this is a bug because Speechly doesn't have .lang.
        const isLanguageChanged = language && language !== this.recognition.lang
        if (isContinuousChanged || isLanguageChanged) {
            if (get(this.listening)) {
                await this.stopListening()
            }
            this.recognition.continuous = isContinuousChanged ? continuous : this.recognition.continuous
            // @ts-expect-error I believe this is a bug because Speechly doesn't have .lang.
            this.recognition.lang = isLanguageChanged ? language : this.recognition.lang
        }
        if (!get(this.listening)) {
            if (!this.recognition.continuous) {
                this.resetTranscript()
                this.emitClearTranscript()
            }
            try {
                await this.start()
                this.emitListeningChange(true)
            } catch (e) {
                // DOMExceptions indicate a redundant microphone start - safe to swallow
                if (!(e instanceof DOMException)) {
                    this.emitMicrophoneAvailabilityChange(false)
                }
            }
        }
    }

    async abortListening() {
        console.log('abortListening');
        this.disconnect('ABORT')
        this.emitListeningChange(false)
        await new Promise(resolve => {
            this.onStopListening = resolve
        })
    }

    async stopListening() {
        console.log('stopListening');
        this.disconnect('STOP')
        this.emitListeningChange(false)
        await new Promise(resolve => {
            this.onStopListening = resolve
        })
    }

    getRecognition() {
        console.log('getRecognition');
        return this.recognition
    }

    async start() {
        console.log('Start');
        if (this.recognition && !get(this.listening)) {
            await this.recognition.start()
            this.listening.set(true)
        }
    }

    stop() {
        console.log('Stop');
        if (this.recognition && get(this.listening)) {
            this.recognition.stop()
            this.listening.set(false)
        }
    }

    abort() {
        console.log('Abort');
        if (this.recognition && get(this.listening)) {
            this.recognition.abort()
            this.listening.set(false)
        }
    }
}