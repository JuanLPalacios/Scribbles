import { createContext, ReactNode } from 'react';
import { CanvasEvent } from '../types/CanvasEvent';

export const ToolContext = createContext<Tool>({
    setup: () => { },
    dispose: () => { },
    mouseDown: () => { },
    mouseUp: () => { },
    mouseMove: () => { },
    click: () => { },
});

export type Tool = {
    setup: ()=>void
    dispose: ()=>void
    mouseDown: (_event: CanvasEvent)=>void
    mouseUp: (_event: CanvasEvent)=>void
    mouseMove: (_event: CanvasEvent)=>void
    click: (_event: CanvasEvent)=>void
};

export type ToolFunctions = {
    children: ReactNode;
};