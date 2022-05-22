import { CLEAR_TRANSCRIPT, APPEND_TRANSCRIPT } from './constants'
import type { TranscriptAction } from './types'

export const clearTranscript = (): TranscriptAction => {
    console.log("clearTranscript action");
    return { type: CLEAR_TRANSCRIPT }
}

export const appendTranscript = (interimTranscript: string, finalTranscript: string): TranscriptAction => {
    console.log("appendTranscript action");
    return {
        type: APPEND_TRANSCRIPT,
        payload: {
            interimTranscript,
            finalTranscript
        }
    }
}