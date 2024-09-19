import { createContext, ReactNode, useState } from 'react';
import { StatePair } from '../types/StatePair';
import { AlphaOptions } from './MenuOptions';

export const AlphaOptionsContext = createContext<StatePair<AlphaOptions>>([
    { alpha: 1 },
    () => undefined
]
);

export const AlphaOptionsContextProvider = (props: { children: ReactNode; }) => {
    const value = useState<AlphaOptions>({ alpha: 1 });
    return <AlphaOptionsContext.Provider value={value}>
        {props.children}
    </AlphaOptionsContext.Provider>;
};

