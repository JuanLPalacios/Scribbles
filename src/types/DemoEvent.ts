/**
 * Demo recording event types for session capture and playback
 */

import { DrawingState } from '../contexts/DrawingContext';
import { CanvasEvent } from './CanvasEvent';

export type DemoEventType =
    | 'init'
    | 'pointerdown'
    | 'pointermove'
    | 'pointerup'
    | 'tool-change'
    | 'brush-change'
    | 'color-change'
    | 'layer-add'
    | 'layer-remove'
    | 'layer-select'
    | 'transform';

export type DemoEvent = {
    timestamp: number;
    type: DemoEventType;
    data: unknown;
};

export type InitEvent = DemoEvent & {
    type: 'init';
    data: {
        drawing: DrawingState;
        tool: string;
        brushId: string;
        color: string;
    };
};

export type PointerDownEvent = DemoEvent & {
    type: 'pointerdown';
    data: CanvasEvent;
};

export type PointerMoveEvent = DemoEvent & {
    type: 'pointermove';
    data: CanvasEvent;
};

export type PointerUpEvent = DemoEvent & {
    type: 'pointerup';
    data: CanvasEvent;
};

export type ToolChangeEvent = DemoEvent & {
    type: 'tool-change';
    data: {
        toolId: string;
    };
};

export type BrushChangeEvent = DemoEvent & {
    type: 'brush-change';
    data: {
        brushId: string;
    };
};

export type ColorChangeEvent = DemoEvent & {
    type: 'color-change';
    data: {
        color: string;
    };
};

export type LayerAddEvent = DemoEvent & {
    type: 'layer-add';
    data: {
        at: number;
    };
};

export type LayerRemoveEvent = DemoEvent & {
    type: 'layer-remove';
    data: {
        at: number;
    };
};

export type LayerSelectEvent = DemoEvent & {
    type: 'layer-select';
    data: {
        at: number;
    };
};

export type TransformEvent = DemoEvent & {
    type: 'transform';
    data: {
        matrix: number[]; // 6 numbers representing DOMMatrix [a, b, c, d, e, f]
    };
};

export type DemoFile = {
    version: string;
    events: DemoEvent[];
    duration: number; // Total duration in milliseconds
};
