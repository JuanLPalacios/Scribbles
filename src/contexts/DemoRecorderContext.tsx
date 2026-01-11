/**
 * Demo recording and playback context for capturing and replaying drawing sessions
 */

import { createContext, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { DemoEvent, DemoFile, InitEvent } from '../types/DemoEvent';

export type RecordingState = 'idle' | 'recording' | 'playing';

export type DemoRecorderState = {
    state: RecordingState;
    startTime: number;
};

export type DemoRecorderActions = {
    startRecording: (initEvent?: InitEvent) => void;
    stopRecording: () => DemoFile | null;
    recordEvent: (event: DemoEvent) => void;
    playDemo: (demo: DemoFile) => Promise<void>;
    stopPlayback: () => void;
    exportDemo: (demo: DemoFile, filename: string) => void;
    importDemo: (file: File) => Promise<DemoFile>;
};

const initialState: DemoRecorderState = {
    state: 'idle',
    startTime: 0,
};

export const DemoRecorderContext = createContext<[DemoRecorderState, DemoRecorderActions]>([
    initialState,
    {
        startRecording: () => undefined,
        stopRecording: () => null,
        recordEvent: () => undefined,
        playDemo: async () => undefined,
        stopPlayback: () => undefined,
        exportDemo: () => undefined,
        importDemo: async () => ({ version: '1.0.0', events: [], duration: 0 }),
    }
]);

export const DemoRecorderProvider = (props: { children: ReactNode }) => {
    const [state, setState] = useState<DemoRecorderState>(initialState);
    const eventsRef = useRef<DemoEvent[]>([]);
    const playbackTimeoutRef = useRef<number | null>(null);
    const actions = useMemo(() => ({
        startRecording: (initEvent?: InitEvent) => {
            // Use provided initEvent or start with empty events list
            const events = initEvent ? [initEvent] : [];
            eventsRef.current = events;
            setState({
                state: 'recording',
                startTime: Date.now(),
            });
        },
        stopRecording: (): DemoFile | null => {
            if (state.state !== 'recording') return null;

            const duration = Date.now() - state.startTime;
            const demoFile: DemoFile = {
                version: '1.0.0',
                events: eventsRef.current,
                duration,
            };

            setState({
                ...state,
                state: 'idle',
            });

            return demoFile;
        },
        recordEvent: (event: DemoEvent) => {
            if (state.state !== 'recording') return;

            const eventWithTimestamp = {
                ...event,
                timestamp: Date.now() - state.startTime,
            };

            eventsRef.current.push(eventWithTimestamp);
            setState(prev => ({
                ...prev,
            }));
            console.log(eventsRef.current.length);
        },
        playDemo: async (demo: DemoFile) => {
            setState(prev => ({
                ...prev,
                state: 'playing',
                events: demo.events,
                duration: demo.duration,
                currentTime: 0,
            }));
        },
        stopPlayback: () => {
            if (playbackTimeoutRef.current) {
                clearTimeout(playbackTimeoutRef.current);
                playbackTimeoutRef.current = null;
            }

            setState(prev => ({
                ...prev,
                state: 'idle',
                currentTime: 0,
            }));
        },
        exportDemo: (demo: DemoFile, filename: string) => {
            const json = JSON.stringify(demo, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename.endsWith('.demo') ? filename : `${filename}.demo`;
            a.click();
            URL.revokeObjectURL(url);
        },
        importDemo: async (file: File): Promise<DemoFile> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const demo = JSON.parse(e.target?.result as string) as DemoFile;
                        resolve(demo);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsText(file);
            });
        },
    } as DemoRecorderActions), [state.state, state.startTime]);
    useEffect(() => {
        console.log(state.state);
    }, [state.state]);
    const refe = useRef<any[]>([state, actions]);
    refe.current[0] = state;
    refe.current[1] = actions;
    return (
        <DemoRecorderContext.Provider value={refe.current}>
            {props.children}
        </DemoRecorderContext.Provider>
    );
};
