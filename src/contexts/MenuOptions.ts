import { createContext } from 'react';
import Brush from '../abstracts/Brush';
import { ToolButton } from '../types/ToolButton';
import { StatePair } from '../types/StatePair';

export type MenuOptions = ToolOptions & BrushOptions & ColorOptions & AlphaOptions

export type ToolOptions = {
    tools:ToolButton[],
    selectedTool:number
};

export type ColorOptions = {
    color:string,
};

export type AlphaOptions = {
    alpha:number,
};

export type BrushOptions = {
    brushes:Brush[],
    selectedBrush:number,
    brushWidth:number,
};

export type ToleranceOptions = {
    tolerance:number,
};

export const MenuContext = createContext<StatePair<MenuOptions>>([
    {
        brushes: [],
        brushWidth: 0,
        selectedBrush: 0,
        selectedTool: 0,
        tools: [],
        color: '#000000',
        alpha: 1,
    },
    ()=>undefined]
);