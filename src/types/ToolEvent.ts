import { DrawingState } from '../contexts/DrawingState';
import { MenuOptions } from '../contexts/MenuOptions';
import { StatePair } from './StatePair';

export type ToolEvent = {
    drawingContext:StatePair<DrawingState|undefined>;
    menuContext:StatePair<MenuOptions>;
}