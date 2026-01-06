/**
 * Higher-order components for recording and playback capabilities
 */

import { useEffect, useMemo } from 'react';
import { DemoEvent } from '../types/DemoEvent';
import { useDemoRecorder } from '../hooks/useDemoRecorder';

/**
 * Generic higher-order component for recording and playback
 * Wraps any hook and automatically records/replays all function calls and state updates
 */
export const RecordableHOC = <T, >(hookFn: () => T): (() => T) => {
    return () => {
        return RecordableHookImpl(hookFn);
    };
};

/**
 * Internal hook version of RecordableHOC that properly uses React Hooks
 */
function RecordableHookImpl<T>(hookFn: () => T): T {
    const result = hookFn();
    const [demoState, demoActions] = useDemoRecorder();
    //const [demoState, demoActions] = [{ state: '', events: [] }, { stopPlayback: ()=>{}, recordEvent: (e:DemoEvent)=>{} }];

    // Record effect - wraps result with recording
    const wrappedResult = useMemo(() => {
        return wrapForRecording(result, demoState, demoActions);
    }, [result, demoState.state, demoActions]);

    // Playback effect - replays recorded events by calling methods/functions with stored data
    useEffect(() => {
        if (demoState.state !== 'playing' || demoState.events.length < 2) return;

        let i = 1;
        let timeout: number | null = null;

        const playNext = () => {
            const event = demoState.events[i];
            if (!event) {
                demoActions.stopPlayback();
                return;
            }

            // Replay by calling the method/function with stored data
            replayEvent(wrappedResult, event);

            if (i + 1 < demoState.events.length) {
                const delay = demoState.events[i + 1].timestamp - event.timestamp;
                i++;
                timeout = window.setTimeout(playNext, delay);
            } else {
                demoActions.stopPlayback();
            }
        };

        timeout = window.setTimeout(playNext, 0);

        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, [demoState.state, demoState.events, wrappedResult, demoActions]);

    return result;
    //return wrappedResult;
}

/**
 * Wraps a result with recording capabilities
 */
function wrapForRecording<T>(result: T, demoState: any, demoActions: any): T {
    if (!result) return result;

    // If it's a function, wrap it
    if (typeof result === 'function') {
        return ((...args: any[]) => {
            if (demoState.state === 'recording') {
                demoActions.recordEvent({
                    timestamp: 0,
                    type: 'call',
                    data: args.length === 1 ? args[0] : args,
                });
            }
            return (result as any)(...args);
        }) as T;
    }

    // If it's an array (StatePair), wrap the setState function
    if (Array.isArray(result) && result.length === 2) {
        const [state, setState] = result as any;
        return [
            state,
            (newStateOrUpdater: any) => {
                const newState = typeof newStateOrUpdater === 'function'
                    ? newStateOrUpdater(state)
                    : newStateOrUpdater;

                if (demoState.state === 'recording') {
                    demoActions.recordEvent({
                        timestamp: 0,
                        type: 'state',
                        data: newState,
                    });
                }

                setState(newStateOrUpdater);
            }
        ] as T;
    }

    // If it's an object, wrap its methods
    if (typeof result === 'object') {
        const wrapped: any = {};
        for (const key in result) {
            const value = (result as any)[key];
            if (typeof value === 'function') {
                wrapped[key] = (...args: any[]) => {
                    if (demoState.state === 'recording') {
                        demoActions.recordEvent({
                            timestamp: 0,
                            type: key,
                            data: args.length === 1 ? args[0] : args,
                        });
                    }
                    return value.apply(result, args);
                };
            } else {
                wrapped[key] = value;
            }
        }
        return wrapped as T;
    }

    return result;
}

/**
 * Replays an event on a result by calling the appropriate method/function
 */
function replayEvent<T>(result: T, event: DemoEvent): void {
    if (!result) return;

    // For functions, call with the stored data
    if (typeof result === 'function') {
        const args = Array.isArray(event.data) ? event.data : [event.data];
        (result as any)(...args);
        return;
    }

    // For arrays (StatePair), call setState with the stored data
    if (Array.isArray(result) && result.length === 2) {
        const setState = result[1];
        setState(() => event.data);
        return;
    }

    // For objects, call the method matching the event type
    if (typeof result === 'object') {
        const method = (result as any)[event.type];
        if (typeof method === 'function') {
            const args = Array.isArray(event.data) ? event.data : [event.data];
            method.apply(result, args);
        }
    }
}
