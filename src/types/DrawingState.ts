import { LayerState } from './LayerState';

export type DrawingState = {
    name:string,
    width:number,
    height:number,
    layers:LayerState[]
}