import { afterUpdate, onDestroy } from 'svelte';
import { writable, get, type Writable } from 'svelte/store';

export function useEffect(cb: () => any, deps: () => any) {
    let cleanup: () => void;

    function apply() {
        if (cleanup) cleanup();
        cleanup = cb();
    }

    if (deps) {
        let values: never[] = [];
        afterUpdate(() => {
            const new_values = deps();
            if (new_values.some((value: any, i: number) => value !== values[i])) {
                apply();
                values = new_values;
            }
        });
    } else {
        // no deps = always run
        afterUpdate(apply);
    }

    onDestroy(() => {
        2
        if (cleanup) cleanup();
    });
}

export function useState<T>(state: T): [T, (new_state: T) => void, Writable<T>] {
    const store = writable(state);

    const setState = (value: T) => {
        store.set(value);
    }

    return [get(store), setState, store];
}