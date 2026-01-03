/**
 * Demo recording and playback context for capturing and replaying drawing sessions
 */

import { createContext, ReactNode, useCallback, useRef, useState } from 'react';
import { DemoEvent, DemoFile, InitEvent } from '../types/DemoEvent';
import { useEditor } from '../hooks/useEditor';
import { useToolOptions } from '../hooks/useToolOptions';
import { useBrushesOptions } from '../hooks/useBrushesOptions';

export type RecordingState = 'idle' | 'recording' | 'playing';

export type DemoRecorderState = {
    state: RecordingState;
    events: DemoEvent[];
    startTime: number;
    currentTime: number;
    duration: number;
};

export type DemoRecorderActions = {
    startRecording: () => void;
    stopRecording: () => DemoFile | null;
    recordEvent: (event: DemoEvent) => void;
    playDemo: (demo: DemoFile) => Promise<void>;
    stopPlayback: () => void;
    exportDemo: (demo: DemoFile, filename: string) => void;
    importDemo: (file: File) => Promise<DemoFile>;
};

const initialState: DemoRecorderState = {
    state: 'idle',
    events: [],
    startTime: 0,
    currentTime: 0,
    duration: 0,
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
    const [editor] = useEditor();
    const [toolOptions] = useToolOptions();
    const [brushesOptions] = useBrushesOptions();

    const startRecording = useCallback(() => {
        const drawing = editor.drawing;
        if (!drawing) return;

        const currentTool = toolOptions.tools[toolOptions.selectedTool];
        const currentBrush = brushesOptions.brushesPacks[brushesOptions.selectedBrush];

        const initEvent: InitEvent = {
            timestamp: 0,
            type: 'init',
            data: {
                drawing: drawing.data,
                tool: currentTool.name || 'draw',
                brushId: currentBrush?.brush?.name || 'solid',
                color: '#000000', // TODO: Get from color context when available
            },
        };

        eventsRef.current = [initEvent];
        setState({
            state: 'recording',
            events: [initEvent],
            startTime: Date.now(),
            currentTime: 0,
            duration: 0,
        });
    }, [editor, toolOptions, brushesOptions]);

    const stopRecording = useCallback((): DemoFile | null => {
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
            duration,
        });

        return demoFile;
    }, [state]);

    const recordEvent = useCallback((event: DemoEvent) => {
        if (state.state !== 'recording') return;

        const eventWithTimestamp = {
            ...event,
            timestamp: Date.now() - state.startTime,
        };

        eventsRef.current.push(eventWithTimestamp);
        setState(prev => ({
            ...prev,
            events: [...prev.events, eventWithTimestamp],
        }));
    }, [state.state, state.startTime]);

    const playDemo = useCallback(async (demo: DemoFile) => {
        setState(prev => ({
            ...prev,
            state: 'playing',
            events: demo.events,
            duration: demo.duration,
            currentTime: 0,
        }));
    }, []);

    const stopPlayback = useCallback(() => {
        if (playbackTimeoutRef.current) {
            clearTimeout(playbackTimeoutRef.current);
            playbackTimeoutRef.current = null;
        }

        setState(prev => ({
            ...prev,
            state: 'idle',
            currentTime: 0,
        }));
    }, []);

    const exportDemo = useCallback((demo: DemoFile, filename: string) => {
        const json = JSON.stringify(demo, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.endsWith('.demo') ? filename : `${filename}.demo`;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    const importDemo = useCallback(async (file: File): Promise<DemoFile> => {
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
    }, []);

    const actions: DemoRecorderActions = {
        startRecording,
        stopRecording,
        recordEvent,
        playDemo,
        stopPlayback,
        exportDemo,
        importDemo,
    };

    return (
        <DemoRecorderContext.Provider value={[state, actions]}>
            {props.children}
        </DemoRecorderContext.Provider>
    );
};
