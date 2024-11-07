import { createContext, Dispatch, ReactNode, useState, useContext, useCallback } from 'react';
import { basicGlobalProviders } from '../contexts/BasicGlobalContext';
import { uid } from '../lib/uid';

export function createBasicGlobalHook<T>(): () => [T | undefined, (value: T) => void]
export function createBasicGlobalHook<T>(defaultValue: T): () => [T, (value: T) => void]
export function createBasicGlobalHook<T>(defaultValue?: T): () => [T | undefined, (value: T) => void] {
    const key = uid();
    const { Context } = basicGlobalProviders[key] = basicGlobalProviders[key] || (() => {
        const Context = createContext<[T|undefined, Dispatch<React.SetStateAction<T|undefined>>]>([undefined, () => { }]);
        return {
            Context,
            Provider({ children }: { children: ReactNode; }) {
                const pair = useState(defaultValue);
                return <Context.Provider value={pair}>{children}</Context.Provider>;
            }
        };
    })();
    return () => {
        const [value, dispatch] = useContext(Context);
        const setValue = useCallback((value: T) => {
            dispatch(() => {
                return value;
            });
        }, [dispatch]);
        return [value || defaultValue, setValue] as const;
    };
}
