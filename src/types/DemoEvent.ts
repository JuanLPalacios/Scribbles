/**
 * Demo recording event types for session capture and playback
 * Events are stored generically without specific type definitions
 */

export type DemoEvent = {
    timestamp: number;
    type: string;
    data: unknown;
};

export type DemoFile = {
    version: string;
    events: DemoEvent[];
    duration: number; // Total duration in milliseconds
};
