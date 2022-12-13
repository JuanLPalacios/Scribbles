import { ToolEvent } from './ToolEvent';

export type CanvasEvent<O> = {
    point:DOMPoint
} & ToolEvent<O>