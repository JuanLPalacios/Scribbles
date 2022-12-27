import { DrawingState } from '../contexts/DrawingState';
import { StatePair } from './StatePair';

export type ToolEvent<O> = {
    drawingContext:StatePair<DrawingState|undefined>;
    menuContext:StatePair<O>;
}