import { createContext, ReactNode, useState } from 'react';
import { StatePair } from '../types/StatePair';
import { ColorOptions } from './MenuOptions';

export const ColorOptionsContext = createContext<StatePair<ColorOptions>>([
    { color: '#000000' },
    () => undefined
]
);

export const ColorOptionsContextProvider = (props: { children: ReactNode; }) => {
    const value = useState<ColorOptions>({ color: '#000000' });
    return <ColorOptionsContext.Provider value={value}>
        {props.children}
    </ColorOptionsContext.Provider>;
};

