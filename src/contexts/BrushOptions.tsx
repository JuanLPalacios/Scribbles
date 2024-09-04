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
import { DrawableState } from '../types/DrawableState';

export type BrushOptions = {
    brushesPacks: {brush:Brush, preview?:DrawableState}[];
    selectedBrush: number;
    brushWidth: number;
};

export const BrushesContext = createContext<StatePair<BrushOptions>>([
    {
        brushesPacks: [],
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
            brushesPacks: [
                new SolidBrush(),
                new TextureBrush(),
                new Marker(),
                new StiffBrush(round as ConstructorParameters<typeof StiffBrush>[0]),
                new StiffBrush(oldRound as ConstructorParameters<typeof StiffBrush>[0]),
                new StiffBrush(diagonal as ConstructorParameters<typeof StiffBrush>[0]),
            ].map(brush=>({ brush })),
            selectedBrush: 0,
            brushWidth: 20
        };
    });
    const [options, setOptions] = useMenuOptions;
    useEffect(()=>{
        if(brushes)
            setOptions({ ...options, brushesPacks: brushes.map(brushFormObj).map(brush=>({ brush })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brushes]);
    return<BrushesContext.Provider value={useMenuOptions}>
        {props.children}
    </BrushesContext.Provider>;
};

