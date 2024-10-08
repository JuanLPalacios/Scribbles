import { createContext, useEffect, useState, ReactNode } from 'react';
import { StatePair } from '../types/StatePair';
import { DrawableState } from '../types/DrawableState';
import { useStoredBrushes } from '../hooks/useStoredBrushes';
import { SerializedBrush } from '../lib/Serialization';

export type BrushOptions = {
    brushesPacks: {brush:SerializedBrush, preview?:DrawableState}[];
    selectedBrush: number;
    brushWidth: number;
};

export const BrushesOptionsContext = createContext<StatePair<BrushOptions>>([
    {
        brushesPacks: [],
        brushWidth: 0,
        selectedBrush: 0,
    },
    () => undefined
]
);

export const BrushesOptionsContextProvider = (props: { children: ReactNode }) => {
    const [brushes] = useStoredBrushes();
    const useMenuOptions = useState<BrushOptions>(()=>{
        return {
            brushesPacks: brushes.map(brush=>({ brush })),
            selectedBrush: 0,
            brushWidth: 20
        };
    });
    const [options, setOptions] = useMenuOptions;
    useEffect(()=>{
        if(brushes)
            setOptions({ ...options, brushesPacks: brushes.map(brush=>({ brush })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [brushes]);
    return<BrushesOptionsContext.Provider value={useMenuOptions}>
        {props.children}
    </BrushesOptionsContext.Provider>;
};

