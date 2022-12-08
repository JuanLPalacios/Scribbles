import { CanvasEvent } from './CanvasEvent';

export type ToolEvents = {
    setup?:() => void
    dispose?:() => void
    mouseDown?:(event:CanvasEvent) => void
    mouseMove?:(event:CanvasEvent) => void
    mouseUp?:(event:CanvasEvent) => void
    click?:(event:CanvasEvent) => void
}