import { createContext, ReactNode } from 'react';
import { ToolEvent } from '../types/ToolEvent';
import { CanvasEvent } from '../types/CanvasEvent';

export const ToolContext = createContext<Tool>({
    setup: () => { },
    dispose: () => { },
    mouseDown: () => { },
    mouseUp: () => { },
    mouseMove: () => { },
    click: () => { },
});

export type Tool<P = any> = {
    setup: (event:ToolEvent<P>)=>void
    dispose: (event:ToolEvent<P>)=>void
    mouseDown: (_event: CanvasEvent<P>)=>void
    mouseUp: (_event: CanvasEvent<P>)=>void
    mouseMove: (_event: CanvasEvent<P>)=>void
    click: (_event: CanvasEvent<P>)=>void
};

export type ToolFunctions = {
    children: ReactNode;
};