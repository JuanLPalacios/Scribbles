import { createContext } from 'react';
import Brush from '../abstracts/Brush';
import { ToolButton } from '../types/ToolButton';
import { StatePair } from '../types/StatePair';

export type MenuOptions = {
    selectedLayer:number,
    color:string,
    alpha:number,
    brushes:Brush[],
    selectedBrush:number,
    brushWidth:number,
    tools:ToolButton[],
    selectedTool:number
};

export const MenuContext = createContext<StatePair<MenuOptions>>([
    {
        alpha: 0,
        brushes: [],
        brushWidth: 0,
        color: '',
        selectedBrush: 0,
        selectedLayer: 0,
        selectedTool: 0,
        tools: [],
    },
    ()=>undefined]
);