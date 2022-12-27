import { CanvasEvent } from './CanvasEvent';

export type ToolEvents<O> = {
    setup?:() => void
    dispose?:() => void
    mouseDown?:(event:CanvasEvent<O>) => void
    mouseMove?:(event:CanvasEvent<O>) => void
    mouseUp?:(event:CanvasEvent<O>) => void
    click?:(event:CanvasEvent<O>) => void
}