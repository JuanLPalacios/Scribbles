import { createContext } from 'react';
import { LayerState } from '../types/LayerState';
import { StatePair } from '../types/StatePair';

export type DrawingState = {
    name:string,
    width:number,
    height:number,
    layers:LayerState[]
    selectedLayer:number
};

export const DrawingContext = createContext<StatePair<DrawingState|undefined>>([undefined, ()=>undefined]);