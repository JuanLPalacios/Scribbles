import Brush from '../abstracts/Brush';
import { DrawingState } from './DrawingState';
import { ToolButton } from './ToolButton';

export type MenuOptions<T = any> = {
    drawing?:DrawingState
    selectedLayer:number,
    color:string,
    alpha:number,
    brushes:Brush[],
    selectedBrush:number,
    brushWidth:number,
    tools:ToolButton[],
    selectedTool:number
    toolsOptions?:T,
}