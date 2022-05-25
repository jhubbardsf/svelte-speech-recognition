// import { CLEAR_TRANSCRIPT, APPEND_TRANSCRIPT } from './constants'
// import type { TranscriptAction, TranscriptState } from './types'
// import { concatTranscripts } from './utils'

// const transcriptReducer = (state: TranscriptState, action: TranscriptAction) => {
//     switch (action.type) {
//         case CLEAR_TRANSCRIPT:
//             return {
//                 interimTranscript: '',
//                 finalTranscript: ''
//             }
//         case APPEND_TRANSCRIPT:
//             if (!action.payload) action.payload = { interimTranscript: '', finalTranscript: '' }

//             return {
//                 interimTranscript: action.payload.interimTranscript,
//                 finalTranscript: concatTranscripts(state.finalTranscript, action.payload.finalTranscript)
//             }
//         default:
//             throw new Error()
//     }
// }

// export { transcriptReducer }

export { };