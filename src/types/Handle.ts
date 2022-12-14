import { CanvasEvent } from './CanvasEvent';

export interface Handle<O> {
    key: number
    icon: string
    position: DOMPoint
    rotation: DOMMatrix
    onMouseDown:(point:CanvasEvent<O>)=>void
}