import { createContext, useEffect, useState, ReactNode } from 'react';
import Brush from '../abstracts/Brush';
import { StatePair } from '../types/StatePair';
import { useStorage } from '../hooks/useStorage';
import { brushFormObj, SerializedBrush } from '../lib/Serialization';
import SolidBrush from '../brushes/Solid';
import TextureBrush from '../brushes/TextureBrush';
import Marker from '../brushes/Marker';
import StiffBrush from '../brushes/StiffBrush';
import round from '../brushes/stiff/round.json';
import oldRound from '../brushes/stiff/oldRound.json';
import diagonal from '../brushes/stiff/flat.json';

export type BrushOptions = {
    brushes: Brush[];
    selectedBrush: number;
    brushWidth: number;
};

export const BrushesContext = createContext<StatePair<BrushOptions>>([
    {
        brushes: [],
        brushWidth: 0,
        selectedBrush: 0,
    },
    () => undefined
]
);

export const BrushesContextProvider = (props: { children: ReactNode }) => {
    const [brushes] = useStorage<SerializedBrush[]>('brushes');
    const useMenuOptions = useState<BrushOptions>(()=>{
        return {
            brushes: [
                new SolidBrush(),
                new TextureBrush(),
                new Marker(),
                new StiffBrush(round as ConstructorParameters<typeof StiffBrush>[0]),
                new StiffBrush(oldRound as ConstructorParameters<typeof StiffBrush>[0]),
                new StiffBrush(diagonal as ConstructorParameters<typeof StiffBrush>[0]),
            ],
            selectedBrush: 0,
            brushWidth: 20
        };
    });
    const [options, setOptions] = useMenuOptions;
    useEffect(()=>{
        if(brushes)
            setOptions({ ...options, brushes: brushes.map(brushFormObj) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brushes]);
    return<BrushesContext.Provider value={useMenuOptions}>
        {props.children}
    </BrushesContext.Provider>;
};

