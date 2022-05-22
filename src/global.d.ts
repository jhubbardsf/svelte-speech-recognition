import type { SpeechRecognitionClass } from "$lib/types";

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionClass;
        webkitSpeechRecognition: SpeechRecognitionClass;
        webkitAudioContext: AudioContext;
    }

    interface Navigator {
        brave?: () => void;
    }
}