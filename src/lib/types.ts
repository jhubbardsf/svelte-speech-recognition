import type { CLEAR_TRANSCRIPT, APPEND_TRANSCRIPT } from './constants'


type TranscriptAction = { type: typeof CLEAR_TRANSCRIPT | typeof APPEND_TRANSCRIPT, payload?: TranscriptState }
type TranscriptState = { interimTranscript: string, finalTranscript: string }

export type { TranscriptAction, TranscriptState };