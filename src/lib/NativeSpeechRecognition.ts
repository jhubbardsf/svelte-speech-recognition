import { browser } from "$app/env";
import type { SpeechRecognitionClass } from "@speechly/speech-recognition-polyfill";

const NativeSpeechRecognition = !browser ? null : (navigator.brave ? null : window.SpeechRecognition || window.webkitSpeechRecognition);
const isNative = (SpeechRecognition: SpeechRecognitionClass) => SpeechRecognition === NativeSpeechRecognition;
const browserSupportsSpeechRecognition = !!NativeSpeechRecognition;

export { NativeSpeechRecognition, isNative, browserSupportsSpeechRecognition }