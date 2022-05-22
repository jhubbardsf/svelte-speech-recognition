export { };

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
        mozSpeechRecognition: any;
        msSpeechRecognition: any;
        oSpeechRecognition: any;
    }

    interface Navigator {
        brave: any;
    }
}