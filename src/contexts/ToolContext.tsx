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

export type Tool<P = any> = {
    setup: ()=>void
    dispose: ()=>void
    mouseDown: (_event: CanvasEvent<P>)=>void
    mouseUp: (_event: CanvasEvent<P>)=>void
    mouseMove: (_event: CanvasEvent<P>)=>void
    click: (_event: CanvasEvent<P>)=>void
};

export type ToolFunctions = {
    children: ReactNode;
};