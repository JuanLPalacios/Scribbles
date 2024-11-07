import { createContext, ReactNode, useState } from 'react';
import { StatePair } from '../types/StatePair';
import { ToleranceOptions } from './MenuOptions';

export const ToleranceOptionsContext = createContext<StatePair<ToleranceOptions>>([
    { tolerance: 1 },
    () => undefined
]
);

export const ToleranceOptionsContextProvider = (props: { children: ReactNode; }) => {
    const value = useState<ToleranceOptions>({ tolerance: 1 });
    return <ToleranceOptionsContext.Provider value={value}>
        {props.children}
    </ToleranceOptionsContext.Provider>;
};
