import { CanvasEvent } from './CanvasEvent';

export interface Handle {
    key: number
    icon: string
    position: DOMPoint
    rotation: DOMMatrix
    onMouseDown:(point:CanvasEvent)=>void
}