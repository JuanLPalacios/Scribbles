import { CanvasEvent } from './CanvasEvent';

export interface Handle<O = unknown> {
    key: number
    icon: string
    position: DOMPoint
    rotation: DOMMatrix
    onMouseDown:(point:CanvasEvent<O>)=>void
}