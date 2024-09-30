import { CanvasEvent } from './CanvasEvent';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Handle {
    key: number
    icon: string
    position: DOMPoint
    rotation: DOMMatrix
    onMouseDown:(point:CanvasEvent)=>void
}