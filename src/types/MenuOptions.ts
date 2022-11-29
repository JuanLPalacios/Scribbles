import Brush from '../abstracts/Brush';
import { LayerState } from './LayerState';
import { ToolButton } from './ToolButton';

export type MenuOptions<T = any> = {
    layers:LayerState[],
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