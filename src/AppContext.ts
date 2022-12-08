import { createContext, Dispatch, SetStateAction } from 'react';
import Brush from './abstracts/Brush';
import { DrawingState } from './types/DrawingState';
import { LayerState } from './types/LayerState';
import { MenuOptions } from './types/MenuOptions';

type statePair<S> = [S, Dispatch<SetStateAction<S>>];

type AppState = {
    useDrawing:statePair<DrawingState|undefined>
    Tool?:(props: {children: any;}) => JSX.Element
    layer?:LayerState
    brush?:Brush
    useMenuOptions:statePair<MenuOptions>
    useToolsOptions:statePair<any>
} | undefined;

export const AppContext = createContext<AppState>(undefined);