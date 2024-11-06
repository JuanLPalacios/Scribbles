import { createContext, useState, ReactNode } from 'react';
import { StatePair } from '../types/StatePair';

export type ColorPickingState = {
    active: boolean
    color: string
}

export const ColorPickingContext = createContext<StatePair<ColorPickingState>>([
    {
        active: false,
        color: ''
    },
    () => undefined
]
);

export const ColorPickingContextProvider = (props: { children: ReactNode }) => {
    const useColorPicking = useState<ColorPickingState>({
        active: false,
        color: ''
    });
    return<ColorPickingContext.Provider value={useColorPicking}>
        {props.children}
    </ColorPickingContext.Provider>;
};

