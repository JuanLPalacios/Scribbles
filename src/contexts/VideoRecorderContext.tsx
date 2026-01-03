/**
 * Video recorder context for capturing canvas as video stream
 */

import { createContext, ReactNode, useCallback, useRef, useState } from 'react';

export type VideoRecorderState = {
    isRecording: boolean;
    isStreaming: boolean;
    recordedChunks: Blob[];
    streamUrl: string | null;
};

export type VideoRecorderActions = {
    startRecording: (canvas: HTMLCanvasElement, options?: MediaRecorderOptions) => void;
    stopRecording: () => Promise<Blob | null>;
    downloadRecording: (filename?: string) => void;
    startStreaming: (canvas: HTMLCanvasElement) => MediaStream | null;
    stopStreaming: () => void;
    getStreamUrl: () => string | null;
};

const initialState: VideoRecorderState = {
    isRecording: false,
    isStreaming: false,
    recordedChunks: [],
    streamUrl: null,
};

export const VideoRecorderContext = createContext<[VideoRecorderState, VideoRecorderActions]>([
    initialState,
    {
        startRecording: () => undefined,
        stopRecording: async () => null,
        downloadRecording: () => undefined,
        startStreaming: () => null,
        stopStreaming: () => undefined,
        getStreamUrl: () => null,
    }
]);

export const VideoRecorderProvider = (props: { children: ReactNode }) => {
    const [state, setState] = useState<VideoRecorderState>(initialState);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback((canvas: HTMLCanvasElement, options?: MediaRecorderOptions) => {
        try {
            // Capture canvas as stream
            const stream = canvas.captureStream(30); // 30 fps
            streamRef.current = stream;

            // Default options for high quality video
            const defaultOptions: MediaRecorderOptions = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000, // 2.5 Mbps
            };

            // Fallback to VP8 if VP9 is not supported
            let finalOptions = { ...defaultOptions, ...options };
            if (!MediaRecorder.isTypeSupported(finalOptions.mimeType || '')) {
                finalOptions = {
                    mimeType: 'video/webm;codecs=vp8',
                    videoBitsPerSecond: 2500000,
                };
            }

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, finalOptions);
            mediaRecorderRef.current = mediaRecorder;

            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                    setState(prev => ({
                        ...prev,
                        recordedChunks: [...chunksRef.current],
                    }));
                }
            };

            mediaRecorder.start(100); // Collect data every 100ms

            setState({
                isRecording: true,
                isStreaming: false,
                recordedChunks: [],
                streamUrl: null,
            });
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || state.isRecording === false) {
                resolve(null);
                return;
            }

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                setState(prev => ({
                    ...prev,
                    isRecording: false,
                }));
                resolve(blob);
            };

            mediaRecorderRef.current.stop();

            // Stop all tracks in the stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        });
    }, [state.isRecording]);

    const downloadRecording = useCallback((filename = 'scribbles-recording.webm') => {
        if (chunksRef.current.length === 0) {
            console.warn('No recording available to download');
            return;
        }

        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    const startStreaming = useCallback((canvas: HTMLCanvasElement): MediaStream | null => {
        try {
            const stream = canvas.captureStream(30); // 30 fps
            streamRef.current = stream;

            // Create object URL for the stream (for preview purposes)
            const videoElement = document.createElement('video');
            videoElement.srcObject = stream;
            const streamUrl = videoElement.src;

            setState(prev => ({
                ...prev,
                isStreaming: true,
                streamUrl,
            }));

            return stream;
        } catch (error) {
            console.error('Failed to start streaming:', error);
            return null;
        }
    }, []);

    const stopStreaming = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setState(prev => ({
            ...prev,
            isStreaming: false,
            streamUrl: null,
        }));
    }, []);

    const getStreamUrl = useCallback(() => {
        return state.streamUrl;
    }, [state.streamUrl]);

    const actions: VideoRecorderActions = {
        startRecording,
        stopRecording,
        downloadRecording,
        startStreaming,
        stopStreaming,
        getStreamUrl,
    };

    return (
        <VideoRecorderContext.Provider value={[state, actions]}>
            {props.children}
        </VideoRecorderContext.Provider>
    );
};
