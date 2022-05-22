/* eslint-disable @typescript-eslint/no-explicit-any */
import { writable, type Subscriber, type Unsubscriber } from 'svelte/store';
import type { TranscriptAction, TranscriptState } from './types';

type Reducer = (state: TranscriptState, action: TranscriptAction) => TranscriptState;
type Dispatch = (action: TranscriptAction) => void;
type Subscribe = { subscribe: (this: void, run: Subscriber<TranscriptState>) => Unsubscriber };
export function reducible(state: TranscriptState, reducer: Reducer): [Subscribe, Dispatch] {
    const { update, subscribe } = writable(state);

    function dispatch(action: TranscriptAction) {
        update(state => reducer(state, action));
    }

    return [{ subscribe }, dispatch];
}