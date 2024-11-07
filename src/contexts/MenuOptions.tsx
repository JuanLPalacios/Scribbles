import { ReactNode } from 'react';
import { ToolButton } from '../types/ToolButton';
import { BrushesOptionsContextProvider, BrushOptions } from './BrushesOptionsContext';
import { ToolOptionsContextProvider } from './ToolOptionsContext';
import { LoadingOverlayContextProvider } from './LoadingOverlayContext';
import { ColorPickingContextProvider } from './ColorPickingContext';

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

export type ToleranceOptions = {
    tolerance:number,
};

export type MenuOptions = ToolOptions & BrushOptions & ColorOptions & AlphaOptions & ToleranceOptions

export const MenuContextProvider = (props: { children: ReactNode }) => {
    const providers = [
        LoadingOverlayContextProvider,
        BrushesOptionsContextProvider,
        ToolOptionsContextProvider,
        ColorPickingContextProvider
    ];
    return providers.reverse().reduce((children, Provider)=><Provider>{children}</Provider>, props.children);
};

