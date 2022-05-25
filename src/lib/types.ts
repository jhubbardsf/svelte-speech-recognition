import type { CLEAR_TRANSCRIPT, APPEND_TRANSCRIPT } from './constants'

type TranscriptAction = { type: typeof CLEAR_TRANSCRIPT | typeof APPEND_TRANSCRIPT, payload?: TranscriptState }
type TranscriptState = { interimTranscript: string, finalTranscript: string }
type Command = {
    command: string | string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback: any,
    matchInterim?: boolean;
    isFuzzyMatch?: boolean;
    fuzzyMatchingThreshold?: number;
    bestMatchOnly?: boolean;
}

export type { TranscriptAction, TranscriptState, Command };